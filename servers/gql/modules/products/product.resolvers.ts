import { PrismaClient } from "@/app/generated/prisma";
import { GraphQLContext } from "../../context";
import { getCache, setCache } from "@/services/redis.services";

const prisma = new PrismaClient();

export const productResolvers = {
  Query: {
    getProducts: async (_: any, __: any, ctx: GraphQLContext) => {
      const cacheKey = "products:all";

      // 1. Try cache
      const cached = await getCache(cacheKey);
      if (cached) {
        console.log("Returning products from Redis");
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

      // 3. Store in cache (e.g., TTL = 300s)
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
        await setCache(cacheKey, product, 600); // cache for 10 minutes
      }

      return product;
    },

    getProductBySlug: async (_: any, { slug }: { slug: string }) => {
      if (!slug) throw new Error("slug id is required");

      const cacheKey = `products:slug:${slug}`;

      const cached = await getCache(cacheKey);
      if (cached) {
        console.log("⚡ Returning product from Redis");
        return cached;
      }

      const product = await prisma.product.findUnique({
        where: { slug },
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
  },
};
