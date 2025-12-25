import { prisma } from "../../../../lib/db/prisma";
import { getCache, setCache } from "@/services/redis.services";

export const productResolvers = {
  Query: {
    getProducts: async (_: any, { limit, offset }: { limit?: number; offset?: number }) => {
      const cacheKey = limit ? `products:limited:${limit}:${offset || 0}` : "products:all";

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
        ...(limit && { take: limit }),
        ...(offset && { skip: offset }),
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
        where: { slug, status: "ACTIVE" },
        include: {
          seller: { select: { id: true, firstName: true, lastName: true } },
          variants: {
            select: {
              id: true,
              price: true,
              sku: true,
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
      { productId, limit = 10 }: { productId?: string; limit?: number },
      context: any
    ) => {
      const userId = context?.user?.id;
      const cacheKey = `recommendations:${userId || 'guest'}:${productId || 'home'}:${limit}`;

      // Try cache first
      const cached = await getCache<any[]>(cacheKey);
      if (cached) {
        return cached;
      }

      // Helper to gather user interests
      const getUserInterests = async (uid: string) => {
        const [recentOrders, cartItems, wishlistItems, recentlyViewed] = await Promise.all([
          prisma.order.findMany({
            where: { buyerId: uid },
            take: 5,
            include: { items: { include: { variant: { include: { product: true } } } } }
          }),
          prisma.cartItem.findMany({
            where: { userId: uid },
            include: { variant: { include: { product: true } } }
          }),
          prisma.wishlistItem.findMany({
            where: { wishlist: { userId: uid } },
            include: { product: true }
          }),
          prisma.recentlyViewed.findMany({
            where: { userId: uid },
            take: 10,
            include: { product: true }
          })
        ]);

        const categories = new Set<string>();
        const brands = new Set<string>();

        const extract = (prod: any) => {
          if (prod?.categoryId) categories.add(prod.categoryId);
          if (prod?.brand) brands.add(prod.brand);
        };

        recentOrders.forEach(o => o.items.forEach(i => extract(i.variant.product)));
        cartItems.forEach(i => extract(i.variant.product));
        wishlistItems.forEach(i => extract(i.product));
        recentlyViewed.forEach(i => extract(i.product));

        return { categories: Array.from(categories), brands: Array.from(brands) };
      };

      let recommendedProducts: any[] = [];

      // ---------------------------------------------------------
      // SCENARIO 1: LANDING PAGE (No Product ID)
      // ---------------------------------------------------------
      if (!productId) {
        if (userId) {
          // USER FEED: Based on interests
          const interests = await getUserInterests(userId);

          if (interests.categories.length > 0 || interests.brands.length > 0) {
            recommendedProducts = await prisma.product.findMany({
              where: {
                status: "ACTIVE",
                OR: [
                  { categoryId: { in: interests.categories } },
                  { brand: { in: interests.brands } }
                ]
              },
              take: limit,
              orderBy: { createdAt: 'desc' },
              include: {
                variants: { select: { id: true, price: true, mrp: true, sku: true, stock: true, isDefault: true, specifications: true } },
                images: { select: { url: true, altText: true } },
                reviews: { select: { rating: true } },
                category: true,
              }
            });
          }
        }

        // Fallback if no user or no interests found
        if (recommendedProducts.length === 0) {
          recommendedProducts = await prisma.product.findMany({
            where: { status: "ACTIVE" },
            take: limit,
            orderBy: { createdAt: 'desc' }, // Newest or random
            include: {
              variants: { select: { id: true, price: true, mrp: true, sku: true, stock: true, isDefault: true, specifications: true } },
              images: { select: { url: true, altText: true } },
              reviews: { select: { rating: true } },
              category: true,
            }
          });
        }
      }
      // ---------------------------------------------------------
      // SCENARIO 2: PRODUCT PAGE (Vector Similarity + Boost)
      // ---------------------------------------------------------
      else {
        // Get the current product's embedding
        const currentProduct = await prisma.$queryRaw<Array<{ embedding: string }>>`
            SELECT embedding::text FROM "products" WHERE id = ${productId} AND embedding IS NOT NULL
          `;

        if (currentProduct?.[0]?.embedding) {
          const embedding = currentProduct[0].embedding;
          // Find similar products using vector similarity
          const similarProducts = await prisma.$queryRaw<Array<{ id: string; similarity: number }>>`
                SELECT id::text, 1 - (embedding::text::vector <=> ${embedding}::vector) AS similarity
                FROM "products"
                WHERE id != ${productId} AND embedding IS NOT NULL AND status = 'ACTIVE'
                ORDER BY similarity DESC
                LIMIT ${limit + 5} 
            `;
          // Fetch more than limit to allow re-ranking

          const productIds = similarProducts.map((p) => p.id);
          let products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            include: {
              variants: { select: { id: true, price: true, mrp: true, sku: true, stock: true, isDefault: true, specifications: true } },
              images: { select: { url: true, altText: true } },
              reviews: { select: { rating: true } },
              category: true,
            }
          });

          // If user logged in, boost products matching interests
          if (userId) {
            const interests = await getUserInterests(userId);
            // Simple re-rank: Move interested items to top
            products = products.sort((a, b) => {
              const aScore = (interests.categories.includes(a.categoryId || '') ? 1 : 0) + (interests.brands.includes(a.brand || '') ? 1 : 0);
              const bScore = (interests.categories.includes(b.categoryId || '') ? 1 : 0) + (interests.brands.includes(b.brand || '') ? 1 : 0);
              return bScore - aScore;
            });
          }

          recommendedProducts = products.slice(0, limit);
        }

        // Fallback if no embedding or vector search failed
        if (recommendedProducts.length === 0) {
          recommendedProducts = await prisma.product.findMany({
            where: { status: "ACTIVE", id: { not: productId } },
            take: limit,
            include: {
              variants: { select: { id: true, price: true, mrp: true, sku: true, stock: true, isDefault: true, specifications: true } },
              images: { select: { url: true, altText: true } },
              reviews: { select: { rating: true } },
              category: true,
            }
          });
        }
      }

      // Cache the results
      await setCache(cacheKey, recommendedProducts, 1800); // 30 mins

      return recommendedProducts;
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
    getRecentlyViewed: async (_: any, __: any, context: any) => {
      if (!context.user) return [];

      const views = await prisma.recentlyViewed.findMany({
        where: { userId: context.user.id },
        orderBy: { viewedAt: "desc" },
        take: 20,
        include: {
          product: {
            include: {
              seller: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                }
              },
              variants: {
                select: {
                  id: true,
                  price: true,
                  mrp: true,
                  sku: true,
                  stock: true,
                  isDefault: true,
                  specifications: true,
                }
              },
              images: true,
              reviews: { select: { rating: true } },
              category: true,
            }
          }
        }
      });

      return views.map(v => v.product);
    },
    getFrequentlyBoughtTogether: async (_: any, { productId, limit = 5 }: { productId: string, limit?: number }) => {
      // 1. Try Order History (Existing Logic)
      const orders = await prisma.order.findMany({
        where: {
          items: { some: { variant: { productId } } },
          status: { in: ['CONFIRMED', 'DELIVERED', 'SHIPPED', 'PROCESSING'] }
        },
        take: 50,
        include: {
          items: {
            include: {
              variant: {
                select: { productId: true }
              }
            }
          }
        }
      });

      const frequencyMap = new Map<string, number>();

      orders.forEach((order: any) => {
        order.items.forEach((item: any) => {
          if (item?.variant?.productId && item.variant.productId !== productId) {
            const pid = item.variant.productId;
            frequencyMap.set(pid, (frequencyMap.get(pid) || 0) + 1);
          }
        });
      });

      const sortedIds = Array.from(frequencyMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id]) => id);

      let resultIds = [...sortedIds];

      // 2. AI Fallback: Vector Similarity (If not enough bought together)
      if (resultIds.length < limit) {
        // Get the current product's embedding
        const currentProduct = await prisma.$queryRaw<Array<{ embedding: string }>>`
            SELECT embedding::text FROM "products" WHERE id = ${productId} AND embedding IS NOT NULL
          `;

        if (currentProduct?.[0]?.embedding) {
          const embedding = currentProduct[0].embedding;
          // Find similar products using vector similarity
          const excludedIds = [productId, ...resultIds];

          // Fetch more results than needed and filter in JavaScript to avoid SQL array issues
          const allSimilarProducts = await prisma.$queryRaw<Array<{ id: string; similarity: number }>>`
                SELECT id::text, 1 - (embedding::text::vector <=> ${embedding}::vector) AS similarity
                FROM "products"
                WHERE embedding IS NOT NULL 
                AND status = 'ACTIVE'
                ORDER BY similarity DESC
                LIMIT ${(limit - resultIds.length) * 2}
            `;

          // Filter out excluded IDs in JavaScript
          const similarProducts = allSimilarProducts
            .filter(p => !excludedIds.includes(p.id))
            .slice(0, limit - resultIds.length);

          const similarIds = similarProducts.map(p => p.id);
          resultIds = [...resultIds, ...similarIds];
        }

        // 3. Category Fallback: Same category (If still not enough)
        if (resultIds.length < limit) {
          const product = await prisma.product.findUnique({ where: { id: productId }, select: { categoryId: true } });
          if (product?.categoryId) {
            const categoryProducts = await prisma.product.findMany({
              where: {
                categoryId: product.categoryId,
                id: { notIn: [productId, ...resultIds] },
                status: 'ACTIVE'
              },
              take: limit - resultIds.length,
              select: { id: true }
            });
            resultIds = [...resultIds, ...categoryProducts.map(p => p.id)];
          }
        }
      }

      if (resultIds.length === 0) return [];

      const products = await prisma.product.findMany({
        where: { id: { in: resultIds }, status: "ACTIVE" },
        include: {
          variants: {
            select: {
              id: true,
              price: true,
              mrp: true,
              sku: true,
              stock: true,
              isDefault: true,
              specifications: true,
            }
          },
          images: true,
          reviews: { select: { rating: true } },
          category: true,
        }
      });

      // Sort back to the hybrid order (bought together first, then AI/Category)
      const productMap = new Map(products.map(p => [p.id, p]));
      return resultIds.map(id => productMap.get(id)).filter(Boolean);
    }
  },
  Mutation: {
    recordProductView: async (_: any, { productId }: { productId: string }, context: any) => {
      if (!context.user) return false;

      try {
        await prisma.recentlyViewed.upsert({
          where: {
            userId_productId: {
              userId: context.user.id,
              productId
            }
          },
          update: { viewedAt: new Date() },
          create: {
            userId: context.user.id,
            productId
          }
        });
        return true;
      } catch (e) {
        console.error("Failed to record view", e);
        return false;
      }
    }
  }
};
