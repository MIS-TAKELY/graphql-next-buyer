import { Prisma } from "../../../../../app/generated/prisma";
import { detectCategory } from "@/filter/detectCategory";
import { prisma } from "../../../../../lib/db/prisma";
import { generateEmbedding } from "@/lib/embemdind";
import { GraphQLContext } from "@/servers/gql/context";
import { getCache, setCache } from "@/services/redis.services";
import {
  ProductIdWithSimilarity,
  ProductWithDetails,
  TopDealProduct,
  TopDealsArgs,
  VariantWithDeals,
} from "@/types/topDeals";
import {
  getAllDescendantCategoryIds,
  getTopLevelParentCategory,
} from "./topDeal.helper";

export const topDealsResolvers = {
  Query: {
    getTopDealSaveUpTo: async (
      _: unknown,
      { topDealAbout, limit }: TopDealsArgs,
      ctx: GraphQLContext
    ): Promise<TopDealProduct[]> => {
      const cacheKey = `top-deals:${topDealAbout.toLowerCase()}:${limit}`;

      const cached = await getCache<TopDealProduct[]>(cacheKey);

      if (cached) {
        console.log(`⚡ Returning cached Top Deals for ${topDealAbout}`);
        return cached;
      }

      // Step 1: Detect category from the query using AI
      const detectedCategory = await detectCategory(topDealAbout);
      console.log("🎯 Detected category:", detectedCategory);

      // Step 2: Get the detected category from database
      const category = await prisma.category.findFirst({
        where: {
          name: {
            equals: detectedCategory,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      if (!category) {
        console.warn(`⚠️ Category "${detectedCategory}" not found in database`);
        return [];
      }

      console.log("📂 Detected category:", category.name, "ID:", category.id);

      // Step 3: Get top-level parent category
      const topLevelCategory = await getTopLevelParentCategory(category.id);

      if (!topLevelCategory) {
        console.warn(
          `⚠️ Could not find top-level parent for category "${category.name}"`
        );
        return [];
      }

      console.log(
        "🔝 Top-level parent category:",
        topLevelCategory.name,
        "ID:",
        topLevelCategory.id
      );

      // Step 4: Get all descendant category IDs
      const categoryIds = await getAllDescendantCategoryIds(
        topLevelCategory.id
      );
      console.log(
        `📊 Searching across ${categoryIds.length} categories (including children)`
      );

      // Step 5: Generate embedding for semantic search
      const vector = await generateEmbedding(topDealAbout);
      const vectorString = `[${vector.join(",")}]`;

      // Step 6: Vector search within the top-level category and its descendants
      const idResults = await prisma.$queryRaw<ProductIdWithSimilarity[]>(
        Prisma.sql`
          SELECT 
            id::text,
            1 - (embedding <=> ${Prisma.raw(
          `'${vectorString}'::vector`
        )}) AS similarity
          FROM "products"
          WHERE status = 'ACTIVE'
            AND "categoryId" = ANY(${categoryIds}::text[])
          ORDER BY similarity DESC
          LIMIT ${50}
        `
      );

      if (idResults.length === 0) {
        console.log(
          "⚠️ No products found in category hierarchy:",
          topLevelCategory.name
        );
        return [];
      }

      console.log(
        `✅ Found ${idResults.length} products in category hierarchy`
      );

      const productIds = idResults.map((p: any) => p.id);

      // Step 7: Fetch full product details with proper typing
      const products = (await prisma.product.findMany({
        where: {
          id: { in: productIds },
          status: "ACTIVE",
          categoryId: { in: categoryIds },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          brand: true,
          variants: {
            where: { stock: { gt: 0 } },
            select: {
              id: true,
              sku: true,
              price: true,
              mrp: true,
              stock: true,
              specifications: {
                select: {
                  key: true,
                  value: true,
                },
              },
            },
          },
          images: {
            where: { mediaType: "PRIMARY" },
            take: 1,
            select: {
              url: true,
              altText: true,
              sortOrder: true,
            },
            orderBy: { sortOrder: "asc" },
          },
          category: {
            select: {
              id: true,
              name: true,
              children: {
                select: {
                  name: true,
                },
              },
            },
          },
          productOffers: {
            where: {
              offer: {
                isActive: true,
                startDate: { lte: new Date() },
                endDate: { gte: new Date() },
              },
            },
            select: {
              offer: {
                select: {
                  id: true,
                  title: true,
                  type: true,
                  value: true,
                },
              },
            },
          },
          reviews: {
            where: { status: "APPROVED" },
            select: { rating: true },
          },
        },
      })) as ProductWithDetails[];

      console.log(`📦 Retrieved ${products.length} full product records`);

      // Step 8: Calculate deals for each product
      const productsWithDeals: TopDealProduct[] = products
        .map((product): TopDealProduct | null => {
          if (!product.variants?.length) return null;

          const variantsWithDeals: VariantWithDeals[] = product.variants.map(
            (variant) => {
              const price = Number(variant.price);
              const mrp = Number(variant.mrp);
              let finalPrice = price;
              let discountAmount = mrp - price;
              let discountPercentage =
                mrp > 0 ? ((mrp - price) / mrp) * 100 : 0;

              const offer = product.productOffers?.[0]?.offer;
              if (offer) {
                if (offer.type === "PERCENTAGE") {
                  const offerDiscount = (price * Number(offer.value)) / 100;
                  finalPrice = price - offerDiscount;
                  discountAmount += offerDiscount;
                } else if (offer.type === "FIXED_AMOUNT") {
                  finalPrice = Math.max(0, price - Number(offer.value));
                  discountAmount += Number(offer.value);
                }
                discountPercentage = mrp > 0 ? (discountAmount / mrp) * 100 : 0;
              }

              return {
                ...variant,
                finalPrice: Math.round(finalPrice * 100) / 100,
                discountAmount: Math.round(discountAmount * 100) / 100,
                discountPercentage: Math.round(discountPercentage),
              } as VariantWithDeals;
            }
          );

          const bestVariant = variantsWithDeals.reduce((best, current) =>
            current.discountPercentage > best.discountPercentage
              ? current
              : best
          );

          const avgRating =
            product.reviews.length > 0
              ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
              product.reviews.length
              : 0;

          return {
            ...product,
            name: product.name,
            imageUrl: product.images[0]?.url || null,
            imageAltText: product.images[0]?.altText || null,
            saveUpTo: bestVariant.discountAmount,
            discountPercentage: bestVariant.discountPercentage,
            avgRating: Math.round(avgRating * 10) / 10,
            variants: variantsWithDeals,
            product,
          } as TopDealProduct;
        })
        .filter((p): p is TopDealProduct => p !== null && p.saveUpTo > 0)
        .sort((a, b) => a.saveUpTo - b.saveUpTo)
        .slice(0, limit);

      // console.log("productsWithDeals-->", productsWithDeals);
      // console.log(`💰 Top deals found: ${productsWithDeals.length}`);

      await setCache(cacheKey, productsWithDeals, 86400);

      return productsWithDeals;
    },
  },
};
