import { prisma } from "@/lib/db/prisma";
import { getCache, setCache } from "@/services/redis.services";

export const productResolvers = {
  Query: {
    getProductBySlug: async (_: any, { slug }: { slug: string }) => {
      if (!slug) throw new Error("Slug is required");

      const productKey = `product:${slug}`;
      const cached = await getCache(productKey);

      if (cached) {
        console.log(`⚡ Returning product ${slug} from Redis`);
        return cached;
      }

      console.log("returning from database");

      const start = Date.now();
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          seller: { select: { id: true, firstName: true, lastName: true } },
          variants: {
            select: {
              id: true,
              price: true,
              stock: true,
              isDefault: true,
              mrp: true,
              attributes: true,
              specifications: true,
            },
          },
          deliveryOptions: true,
          images: true,
          reviews: {
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
              user: { select: { firstName: true, lastName: true } },
              media: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              parent: { select: { id: true, name: true } },
            },
          },
          productOffers: {
            include: {
              offer: true,
            },
          },
        },
      });
      console.log(`getProductBySlug query took ${Date.now() - start}ms`);

      if (product) {
        await setCache(productKey, product, 86400); // Cache for 1 day
      }

      return product;
    },
  },
};
