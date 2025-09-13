import { PrismaClient } from "@/app/generated/prisma";
import { getCache, setCache } from "@/services/redis.services";
import { GraphQLContext } from "../../context";

const prisma = new PrismaClient();

export const productResolvers = {
  Query: {
    getProducts: async (_: any, __: any, ctx: GraphQLContext) => {
      const cacheKey = "products:all";

      // 1. Try cache
      const cached = await getCache(cacheKey);
      if (cached) {
        console.log("⚡Returning products from Redis");
        return cached;
      }

      // 2. Query DB
      const products = await prisma.product.findMany({
        include: {
          seller: true,
          variants: {
            include: {
              cartItems: { select: { userId: true, variantId: true } },
            },
          },
          images: true,
          reviews: true,
          category: { include: { children: true, parent: true } },
          brand: true,
          wishlistItems: true,
        },
        orderBy: { createdAt: "desc" },
      });

      await setCache(cacheKey, products, 86400);

      return products;
    },

    getProduct: async (_: any, { productId }: { productId: string }) => {
      if (!productId) throw new Error("Product id is required");

      const cacheKey = `products:id:${productId}`;

      const cached = await getCache(cacheKey);
      if (cached) {
        console.log("⚡ Returning product from Redis");
        return cached;
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          seller: true,
          variants: { include: { specifications: true } },
          images: true,
          reviews: true,
          category: { include: { children: true, parent: true } },
          brand: true,
          wishlistItems: true,
        },
      });

      if (product) {
        await setCache(cacheKey, product, 600);
      }

      return product;
    },

    getProductBySlug: async (
      _: any,
      { slug }: { slug: string },
      ctx: GraphQLContext
    ) => {
      if (!slug) throw new Error("Slug is required");

      const cacheKey = `products:slug:${slug}`;
      const cached = await getCache(cacheKey);
      if (cached) {
        console.log("⚡ Returning product from Redis");
        return cached;
      }

      const start = Date.now();
      const product = await prisma.product.findUnique({
        where: { slug },
        select: {
          id: true,
          name: true,
          description: true,
          slug: true,
          status: true,
          returnPolicy: true,
          warranty: true,
          category: {
            select: {
              id: true,
              name: true,
              parent: { select: { id: true, name: true } },
            },
          },
          brand: { select: { id: true, name: true } },
          seller: { select: { id: true, firstName: true, lastName: true } },
          images: {
            select: {
              id: true,
              url: true,
              altText: true,
              sortOrder: true,
              type: true,
            },
          },
          variants: {
            select: { id: true, price: true, stock: true, isDefault: true },
          },
          reviews: {
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
      });
      console.log(`getProductBySlug query took ${Date.now() - start}ms`);

      if (product) {
        await setCache(cacheKey, product, 3600); // Cache for 1 hour
      }

      return product;
    },
  },
};
