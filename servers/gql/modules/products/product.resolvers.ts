import { PrismaClient } from "@/app/generated/prisma";
import { getCache, setCache } from "@/services/redis.services";

const prisma = new PrismaClient();

export const productResolvers = {
  Query: {
    getProducts: async (_: any, __: any) => {
      const cacheKey = "products:all";

      // Try cache for the list of product slugs
      const cachedSlugs = await getCache<string[]>(`${cacheKey}:slugs`);
      if (cachedSlugs) {
        // Fetch individual produ
        // cts from cache
        const products = await Promise.all(
          cachedSlugs.map(async (slug) => {
            const productKey = `product:${slug}`;
            const cachedProduct = await getCache<any>(productKey);
            if (cachedProduct) {
              console.log(`⚡Returning product ${slug} from Redis`);
              // console.log("product---------------->", cachedProduct);

              return cachedProduct;
            }
            // Fallback to DB if product not in cache
            const product = await prisma.product.findUnique({
              where: { slug },
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
                wishlistItems: true,
              },
            });
            if (product) {
              await setCache(productKey, product, 86400);
            }
            return product;
          })
        );
        return products.filter((p) => p !== null);
      }

      // Query DB if slugs not cached
      const products = await prisma.product.findMany({
        where: {
          status: "ACTIVE",
        },
        include: {
          seller: true,
          variants: {
            include: {
              cartItems: { select: { userId: true, variantId: true } },
            },
          },
          productOffers: {
            include: {
              offer: true,
            },
          },
          images: true,
          reviews: true,
          category: { include: { children: true, parent: true } },
          wishlistItems: true,
        },
        orderBy: { createdAt: "desc" },
      });

      // Cache individual products and slugs
      await Promise.all(
        products.map((product) =>
          setCache(`product:${product.slug}`, product, 86400)
        )
      );
      await setCache(
        `${cacheKey}:slugs`,
        products.map((p) => p.slug),
        86400
      );

      return products;
    },

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
