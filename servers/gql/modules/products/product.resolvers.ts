import { prisma } from "@/lib/db/prisma";
import { getCache, setCache } from "@/services/redis.services";

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

      const PRODUCT_CACHE_VERSION = 'v2';
      const productKey = `product:details:${PRODUCT_CACHE_VERSION}:${slug}`;
      const cached = await getCache(productKey);

      console.log("request reciebed------------", slug)

      if (cached) {
        console.log(`⚡ Returning product ${slug} from Redis`);
        return cached;
      }

      console.log("returning from database");

      const start = Date.now();
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          seller: { select: { id: true, firstName: true, lastName: true, clerkId: true } },
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
              user: { select: { id: true, firstName: true, lastName: true } },
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
        await setCache(productKey, product, 3600); // Match seller's 1-hour cache
      }

      return product;
    },
    getRecommendedProducts: async (
      _: any,
      { productId, limit = 10 }: { productId: string; limit?: number }
    ) => {
      const cacheKey = `recommendations:${productId}:${limit}`;

      // Try cache first
      const cached = await getCache<any[]>(cacheKey);
      if (cached) {
        console.log(`⚡ Returning recommendations for ${productId} from Redis`);
        return cached;
      }

      // Get the current product's embedding
      const currentProduct = await prisma.$queryRaw<
        Array<{ embedding: string }>
      >`
        SELECT embedding::text
        FROM "products"
        WHERE id = ${productId} AND embedding IS NOT NULL
      `;

      if (!currentProduct || currentProduct.length === 0) {
        console.log(`No embedding found for product ${productId}`);
        // Fallback: return random products
        const fallbackProducts = await prisma.product.findMany({
          where: {
            status: "ACTIVE",
            id: { not: productId },
          },
          take: limit,
          include: {
            variants: {
              select: {
                id: true,
                price: true,
                mrp: true,
                sku: true,
                stock: true,
                specifications: true,
              },
            },
            images: {
              select: {
                url: true,
                altText: true,
              },
            },
            reviews: {
              select: { rating: true },
            },
            category: true,
          },
        });
        return fallbackProducts;
      }

      const embedding = currentProduct[0].embedding;

      // Find similar products using vector similarity
      const similarProducts = await prisma.$queryRaw<
        Array<{ id: string; similarity: number }>
      >`
        SELECT 
          id::text,
          1 - (embedding::text::vector <=> ${embedding}::vector) AS similarity
        FROM "products"
        WHERE id != ${productId}
          AND embedding IS NOT NULL
          AND status = 'ACTIVE'
        ORDER BY similarity DESC
        LIMIT ${limit}
      `;

      if (similarProducts.length === 0) {
        return [];
      }

      const productIds = similarProducts.map((p) => p.id);

      // Fetch full product details
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: {
          variants: {
            select: {
              id: true,
              price: true,
              mrp: true,
              sku: true,
              stock: true,
              specifications: true,
            },
          },
          images: {
            select: {
              url: true,
              altText: true,
            },
          },
          reviews: {
            select: { rating: true },
          },
          category: true,
        },
      });

      // Maintain order by similarity
      const productMap = new Map(products.map((p) => [p.id, p]));
      const orderedProducts = productIds
        .map((id) => productMap.get(id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p));

      // Cache the results
      await setCache(cacheKey, orderedProducts, 3600); // Cache for 1 hour

      return orderedProducts;
    },
    getProductsBySeller: async (_: any, { sellerId }: { sellerId: string }) => {
      if (!sellerId) throw new Error("Seller ID is required");

      const products = await prisma.product.findMany({
        where: {
          sellerId: sellerId,
          status: "ACTIVE",
        },
        include: {
          variants: true,
          images: true,
          reviews: true,
          category: true,
          seller: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return products;
    },
  },
};
