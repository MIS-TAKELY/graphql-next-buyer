import { PrismaClient } from "@/app/generated/prisma";
import { opensearchClient, PRODUCT_INDEX } from "../config/opensearch.config";
import { openSearchIndexService } from "./opensearch-index.services";
import { embeddingService } from "./embedding.services";

const prisma = new PrismaClient();

export class ProductIndexingService {
  async indexProduct(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        variants: {
          include: {
            specifications: true,
          },
        },
        images: true,
        reviews: {
          where: { status: "APPROVED" },
        },
        seller: true,
      },
    });

    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    // Calculate aggregated data
    const minPrice = Math.min(...product.variants.map((v) => Number(v.price)));
    const maxPrice = Math.max(...product.variants.map((v) => Number(v.price)));
    const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
          product.reviews.length
        : 0;

    // Prepare specifications from all variants
    const specifications = product.variants.flatMap((v) =>
      v.specifications.map((spec) => ({
        key: spec.key,
        value: spec.value,
      }))
    );

    const document: any = {
      id: product.id,
      name: product.name,
      description: product.description,
      brand: product.brand,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
          }
        : null,
      price: minPrice,
      mrp: Math.max(...product.variants.map((v) => Number(v.mrp))),
      discount: maxPrice > 0 ? ((maxPrice - minPrice) / maxPrice) * 100 : 0,
      status: product.status,
      sellerId: product.sellerId,
      sellerName:
        `${product.seller.firstName || ""} ${
          product.seller.lastName || ""
        }`.trim() || "Unknown Seller",
      rating: avgRating,
      reviewCount: product.reviews.length,
      stock: totalStock,
      images: product.images.map((img) => ({
        url: img.url,
        altText: img.altText,
      })),
      specifications,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    // Only generate embedding if KNN is supported
    if (openSearchIndexService.getKNNSupport()) {
      const searchText = `${product.name} ${product.description || ""} ${
        product.brand
      } ${product.category?.name || ""}`;
      try {
        document.embedding = await embeddingService.generateEmbedding(
          searchText
        );
      } catch (error) {
        console.warn("Failed to generate embedding:", error);
        // Continue without embedding
      }
    }

    await opensearchClient.index({
      index: PRODUCT_INDEX,
      id: product.id,
      body: document,
      refresh: true,
    });

    return document;
  }

  async bulkIndexProducts(limit = 100, offset = 0) {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      skip: offset,
      take: limit,
      include: {
        category: true,
        variants: {
          include: {
            specifications: true,
          },
        },
        images: true,
        reviews: {
          where: { status: "APPROVED" },
        },
        seller: true,
      },
    });

    if (products.length === 0) {
      return { indexed: 0, errors: false };
    }

    const bulkOperations = [];
    const hasKNN = openSearchIndexService.getKNNSupport();

    for (const product of products) {
      try {
        const minPrice =
          product.variants.length > 0
            ? Math.min(...product.variants.map((v) => Number(v.price)))
            : 0;
        const maxPrice =
          product.variants.length > 0
            ? Math.max(...product.variants.map((v) => Number(v.price)))
            : 0;
        const totalStock = product.variants.reduce(
          (sum, v) => sum + v.stock,
          0
        );
        const avgRating =
          product.reviews.length > 0
            ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
              product.reviews.length
            : 0;

        const specifications = product.variants.flatMap((v) =>
          v.specifications.map((spec) => ({
            key: spec.key,
            value: spec.value,
          }))
        );

        const document: any = {
          id: product.id,
          name: product.name,
          description: product.description,
          brand: product.brand,
          category: product.category
            ? {
                id: product.category.id,
                name: product.category.name,
                slug: product.category.slug,
              }
            : null,
          price: minPrice,
          mrp:
            product.variants.length > 0
              ? Math.max(...product.variants.map((v) => Number(v.mrp)))
              : 0,
          discount: maxPrice > 0 ? ((maxPrice - minPrice) / maxPrice) * 100 : 0,
          status: product.status,
          sellerId: product.sellerId,
          sellerName:
            `${product.seller.firstName || ""} ${
              product.seller.lastName || ""
            }`.trim() || "Unknown Seller",
          rating: avgRating,
          reviewCount: product.reviews.length,
          stock: totalStock,
          images: product.images.map((img) => ({
            url: img.url,
            altText: img.altText,
          })),
          specifications,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        };

        // Only generate embedding if KNN is supported
        if (hasKNN) {
          const searchText = `${product.name} ${product.description || ""} ${
            product.brand
          } ${product.category?.name || ""}`;
          try {
            document.embedding = await embeddingService.generateEmbedding(
              searchText
            );
          } catch (error) {
            console.warn(
              `Failed to generate embedding for product ${product.id}:`,
              error
            );
            // Continue without embedding
          }
        }

        bulkOperations.push(
          { index: { _index: PRODUCT_INDEX, _id: product.id } },
          document
        );
      } catch (error) {
        console.error(`Error processing product ${product.id}:`, error);
        // Skip this product and continue
      }
    }

    if (bulkOperations.length > 0) {
      try {
        const response = await opensearchClient.bulk({
          body: bulkOperations,
          refresh: true,
        });

        if (response.body.errors) {
          console.error(
            "Bulk indexing errors:",
            response.body.items
              .filter((item: any) => item.index?.error)
              .map((item: any) => item.index.error)
          );
        }

        return {
          indexed: products.length,
          errors: response.body.errors,
        };
      } catch (error) {
        console.error("Bulk operation failed:", error);
        return {
          indexed: 0,
          errors: true,
        };
      }
    }

    return { indexed: 0, errors: false };
  }

  async removeFromIndex(productId: string) {
    try {
      await opensearchClient.delete({
        index: PRODUCT_INDEX,
        id: productId,
        refresh: true,
      });
    } catch (error: any) {
      if (error.meta?.statusCode === 404) {
        console.log(`Product ${productId} not found in index`);
      } else {
        throw error;
      }
    }
  }
}

export const productIndexingService = new ProductIndexingService();
