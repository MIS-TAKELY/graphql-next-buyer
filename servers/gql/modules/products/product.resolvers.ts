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
                images: { orderBy: { sortOrder: 'asc' } },
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
        return products.filter((p: any) => p !== null);
      }

      // Query DB if slugs not cached
      const products = await prisma.product.findMany({
        where: {},
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
          images: { orderBy: { sortOrder: 'asc' } },
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
        products.map((product: any) =>
          setCache(`product:${product.slug}`, product, 86400)
        )
      );
      await setCache(
        `${cacheKey}:slugs`,
        products.map((p: any) => p.slug),
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

      /*
      if (cached) {
        console.log(`⚡ Returning product ${slug} from Redis`);
        return cached;
      }
      */

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
              sku: true,
              stock: true,
              isDefault: true,
              mrp: true,
              attributes: true,
              specifications: true,
            },
          },
          deliveryOptions: true,
          images: { orderBy: { sortOrder: 'asc' } },
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
    getProductsByCategory: async (_: any, { categorySlug, limit = 50, offset = 0, maxPrice }: { categorySlug: string; limit?: number; offset?: number; maxPrice?: number }) => {
      if (!categorySlug) throw new Error("Category slug is required");

      // First, find the category and its children
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        include: {
          children: { select: { id: true } }
        }
      });

      if (!category) {
        return { products: [], total: 0, category: null };
      }

      // Get all category IDs (parent + children)
      const categoryIds = [category.id, ...category.children.map((c: any) => c.id)];

      // Count total products
      const countWhere: any = {
        categoryId: { in: categoryIds },
        status: 'ACTIVE'
      };

      if (maxPrice) {
        countWhere.variants = {
          some: {
            price: { lte: maxPrice }
          }
        };
      }

      const total = await prisma.product.count({
        where: countWhere
      });

      // Fetch products
      const products = await prisma.product.findMany({
        where: countWhere,
        include: {
          seller: { select: { id: true, firstName: true, lastName: true } },
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
          images: { orderBy: { sortOrder: 'asc' } },
          reviews: { select: { id: true, rating: true } },
          category: { include: { parent: true } },
          productOffers: { include: { offer: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      return { products, total, category };
    },
    getRecommendedProducts: async (
      _: any,
      { productId, limit = 10 }: { productId?: string; limit?: number },
      context: any
    ) => {
      const userId = context?.user?.id;
      const cacheKey = `recommendations:v3:${userId || 'guest'}:${productId || 'home'}:${limit}`;

      // Try cache first
      const cached = await getCache<any[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const { getEmbedding } = await import("@/lib/search/embedding");

      // Helper to gather user interests and create a profile vector
      const getUserInterestVector = async (uid: string) => {
        const [recentOrders, wishlistItems, recentlyViewed] = await Promise.all([
          prisma.order.findMany({
            where: { buyerId: uid },
            take: 5,
            include: { items: { include: { variant: { include: { product: true } } } } }
          }),
          prisma.wishlistItem.findMany({
            where: { wishlist: { userId: uid } },
            include: { product: { select: { id: true } } }
          }),
          prisma.recentlyViewed.findMany({
            where: { userId: uid },
            take: 10,
            include: { product: { select: { id: true } } }
          })
        ]);

        const productIds = new Set<string>();
        const embeddings: number[][] = [];

        const addProduct = (prod: any) => {
          if (prod && !productIds.has(prod.id)) {
            productIds.add(prod.id);
            // In Prisma, Unsupported type comes back as string/buffer representation or sometimes we need to query raw
            // But let's assume if it was fetched, we handle it. 
            // Actually, it's better to fetch embeddings via raw SQL if they are Unsupported.
          }
        };

        const collectedIds = new Set<string>();
        recentOrders.forEach((o: any) => o.items.forEach((i: any) => i.variant.product && collectedIds.add(i.variant.product.id)));
        wishlistItems.forEach((i: any) => i.product && collectedIds.add(i.product.id));
        recentlyViewed.forEach((i: any) => i.product && collectedIds.add(i.product.id));

        if (collectedIds.size === 0) return null;

        // Fetch embeddings for these products
        const productsWithEmbeddings = await prisma.$queryRawUnsafe<any[]>(
          `SELECT embedding FROM products WHERE id = ANY($1) AND embedding IS NOT NULL`,
          Array.from(collectedIds)
        );

        if (productsWithEmbeddings.length === 0) return null;

        // Average the embeddings
        const dim = 384; // Based on schema vector(384)
        const avgVector = new Array(dim).fill(0);
        let count = 0;

        productsWithEmbeddings.forEach((p: any) => {
          // embedding is returned as a string "[0.1, 0.2, ...]" from pgvector in some drivers, 
          // or as a float32 array.
          let vec: number[];
          if (typeof p.embedding === 'string') {
            vec = p.embedding.replace(/[\[\]]/g, '').split(',').map(Number);
          } else {
            vec = Array.from(p.embedding as any);
          }

          if (vec.length === dim) {
            for (let i = 0; i < dim; i++) avgVector[i] += vec[i];
            count++;
          }
        });

        if (count === 0) return null;
        for (let i = 0; i < dim; i++) avgVector[i] /= count;

        return `[${avgVector.join(',')}]`;
      };

      let recommendedIds: string[] = [];

      console.time(`getRecommendedProducts:${productId || 'home'}`);
      try {
        if (productId) {
          console.time(`Vector search for: ${productId}`);
          // SCENARIO: PRODUCT PAGE - Item-to-Item Recommendation
          const productEmbedding = await prisma.$queryRawUnsafe<any[]>(
            `SELECT embedding FROM products WHERE id = $1 AND embedding IS NOT NULL`,
            productId
          );

          if (productEmbedding.length > 0) {
            const vecString = typeof productEmbedding[0].embedding === 'string'
              ? productEmbedding[0].embedding
              : `[${Array.from(productEmbedding[0].embedding as any).join(',')}]`;

            const similarProducts = await prisma.$queryRawUnsafe<any[]>(
              `SELECT id FROM products 
               WHERE id != $1 AND status = 'ACTIVE' AND embedding IS NOT NULL 
               ORDER BY embedding <=> $2::vector 
               LIMIT $3`,
              productId, vecString, limit
            );
            recommendedIds = similarProducts.map(p => p.id);
          }
          console.timeEnd(`Vector search for: ${productId}`);
        }

        if (recommendedIds.length < limit && userId) {
          console.time(`UserInterestVector:${userId}`);
          // SCENARIO: USER FEED or FALLBACK - Personalized Recommendation
          const userVector = await getUserInterestVector(userId);
          if (userVector) {
            const excludeIds = productId ? [productId, ...recommendedIds] : recommendedIds;
            const personalizedProducts = await prisma.$queryRawUnsafe<any[]>(
              `SELECT id FROM products 
               WHERE id != ALL($1) AND status = 'ACTIVE' AND embedding IS NOT NULL 
               ORDER BY embedding <=> $2::vector 
               LIMIT $3`,
              excludeIds, userVector, limit - recommendedIds.length
            );
            recommendedIds.push(...personalizedProducts.map(p => p.id));
          }
          console.timeEnd(`UserInterestVector:${userId}`);
        }

        // Final Fallback: Newest Products
        if (recommendedIds.length < limit) {
          console.time("NewestFallback");
          const excludeIds = productId ? [productId, ...recommendedIds] : recommendedIds;
          const fallbackProducts = await prisma.product.findMany({
            where: {
              id: { notIn: excludeIds },
              status: 'ACTIVE'
            },
            take: limit - recommendedIds.length,
            orderBy: { createdAt: 'desc' },
            select: { id: true }
          });
          recommendedIds.push(...fallbackProducts.map(p => p.id));
          console.timeEnd("NewestFallback");
        }

        if (recommendedIds.length === 0) {
          console.timeEnd(`getRecommendedProducts:${productId || 'home'}`);
          return [];
        }

        // Fetch full data for recommended products
        console.time("FetchFullData");
        let products = await prisma.product.findMany({
          where: { id: { in: recommendedIds } },
          include: {
            seller: { select: { id: true, firstName: true, lastName: true } },
            variants: { select: { id: true, price: true, mrp: true, sku: true, stock: true, isDefault: true, specifications: true } },
            images: { orderBy: { sortOrder: 'asc' } },
            reviews: { select: { id: true, rating: true } },
            category: true,
          }
        });
        console.timeEnd("FetchFullData");

        // SCENARIO 3: LLM RE-RANKING (Optional improvement)
        /*
        if (products.length > 5) {
          try {
            const { callLLM } = await import("@/lib/search/llm");
            const productList = products.map(p => ({ id: p.id, name: p.name, description: p.description?.substring(0, 100) }));
            const prompt = `Given the following products, rank them by how likely a general user would be interested in them. Return ONLY a JSON array of product IDs in order of relevance.
            Products: ${JSON.stringify(productList)}`;

            const llmResponse = await callLLM(prompt);
            const rankedIds = JSON.parse(llmResponse);

            if (Array.isArray(rankedIds)) {
              const productMap = new Map(products.map(p => [p.id, p]));
              products = rankedIds.map(id => productMap.get(id)).filter((p): p is NonNullable<typeof p> => Boolean(p));

              // Ensure we don't lose products that LLM might have missed
              const seenIds = new Set(rankedIds);
              products.push(...products.filter(p => !seenIds.has(p.id)));
            }
          } catch (llmError) {
            console.error("LLM Re-ranking failed, falling back to vector order:", llmError);
          }
        }
        */

        // Restore Order if LLM didn't run or failed
        if (products.length === recommendedIds.length) {
          const productMap = new Map(products.map(p => [p.id, p]));
          const result = recommendedIds.map(id => productMap.get(id)).filter(Boolean);
          // Cache the results
          await setCache(cacheKey, result, 1800); // 30 mins
          console.timeEnd(`getRecommendedProducts:${productId || 'home'}`);
          return result;
        }

        // Cache the results
        await setCache(cacheKey, products.slice(0, limit), 1800); // 30 mins

        console.timeEnd(`getRecommendedProducts:${productId || 'home'}`);
        return products.slice(0, limit);

      } catch (error) {
        console.timeEnd(`getRecommendedProducts:${productId || 'home'}`);
        console.error("Error in optimized recommendation:", error);
        // Fallback to basic category-based if vector search fails
        return prisma.product.findMany({
          where: { status: 'ACTIVE' },
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            seller: { select: { id: true, firstName: true, lastName: true } },
            variants: { select: { id: true, price: true, mrp: true, sku: true, stock: true, isDefault: true, specifications: true } },
            images: { orderBy: { sortOrder: 'asc' } },
            reviews: { select: { id: true, rating: true } },
            category: true,
          }
        });
      }
    },
    getProductsBySeller: async (_: any, { sellerId }: { sellerId: string }) => {
      if (!sellerId) throw new Error("Seller ID is required");

      const products = await prisma.product.findMany({
        where: {
          sellerId: sellerId
        },
        include: {
          variants: true,
          images: { orderBy: { sortOrder: 'asc' } },
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
              images: { orderBy: { sortOrder: 'asc' } },
              reviews: { select: { id: true, rating: true } },
              category: true,
            }
          }
        }
      });

      return views.map((v: any) => v.product);
    },
    getFrequentlyBoughtTogether: async (_: any, { productId, limit = 5 }: { productId: string, limit?: number }) => {
      const cacheKey = `frequently_bought_together:v1:${productId}:${limit}`;
      const cached = await getCache<any[]>(cacheKey);
      if (cached) return cached;

      console.time(`getFrequentlyBoughtTogether:${productId}`);
      // 1. Try Order History (Existing Logic)
      console.time("FBT:OrderHistory");
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
      console.timeEnd("FBT:OrderHistory");

      // 2. LLM + Vector Fallback: If not enough results from history
      if (resultIds.length < limit) {
        console.time("FBT:LLMFallback");
        /*
        try {
          const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { name: true, description: true, category: { select: { name: true } } }
          });

          if (product) {
            const { callLLM } = await import("@/lib/search/llm");
            const prompt = `Given the product "${product.name}" in category "${product.category?.name}", list 3 complementary categories of products that are frequently bought with it (e.g., if it's a "Camera", complementary categories might be "Lens", "SD Card", "Tripod"). Return ONLY a JSON array of category names.`;

            const llmResponse = await callLLM(prompt);
            const complementaryCategories = JSON.parse(llmResponse);

            if (Array.isArray(complementaryCategories) && complementaryCategories.length > 0) {
              // Find one top product for each complementary category using vector similarity to the current product
              const productEmbedding = await prisma.$queryRawUnsafe<any[]>(
                `SELECT embedding FROM products WHERE id = $1 AND embedding IS NOT NULL`,
                productId
              );

              if (productEmbedding.length > 0) {
                const vecString = typeof productEmbedding[0].embedding === 'string'
                  ? productEmbedding[0].embedding
                  : `[${Array.from(productEmbedding[0].embedding as any).join(',')}]`;

                for (const catName of complementaryCategories) {
                  if (resultIds.length >= limit) break;

                  // Find a product in the suggested category that is semantically related
                  const suggestedProducts = await prisma.$queryRawUnsafe<any[]>(
                    `SELECT p.id FROM products p
                     JOIN categories c ON p."categoryId" = c.id
                     WHERE p.id != $1 AND p.status = 'ACTIVE' AND p.embedding IS NOT NULL
                     AND c.name ILIKE $2
                     ORDER BY p.embedding <=> $3::vector
                     LIMIT 1`,
                    productId, `%${catName}%`, vecString
                  );

                  if (suggestedProducts.length > 0 && !resultIds.includes(suggestedProducts[0].id)) {
                    resultIds.push(suggestedProducts[0].id);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error("LLM/Vector fallback for Frequently Bought Together failed:", error);
        }
        */
        console.timeEnd("FBT:LLMFallback");
      }

      // 3. Category Fallback: Final fallback if still not enough
      if (resultIds.length < limit) {
        console.time("FBT:CategoryFallback");
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
          resultIds = [...resultIds, ...categoryProducts.map((p: any) => p.id)];
        }
        console.timeEnd("FBT:CategoryFallback");
      }

      if (resultIds.length === 0) {
        console.timeEnd(`getFrequentlyBoughtTogether:${productId}`);
        return [];
      }

      const products = await prisma.product.findMany({
        where: { id: { in: resultIds } },
        include: {
          seller: { select: { id: true, firstName: true, lastName: true } },
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
          images: { orderBy: { sortOrder: 'asc' } },
          reviews: { select: { id: true, rating: true } },
          category: true,
        }
      });

      // Maintain order: history first, then LLM/category fallback
      const productMap = new Map(products.map(p => [p.id, p]));
      const result = resultIds.map(id => productMap.get(id)).filter(Boolean);

      await setCache(cacheKey, result, 3600); // 1 hour cache
      return result;
    },
    getProductsByIds: async (_: any, { ids }: { ids: string[] }) => {
      if (!ids || ids.length === 0) return [];

      const products = await prisma.product.findMany({
        where: {
          id: { in: ids }
        },
        include: {
          variants: {
            select: {
              id: true,
              price: true,
              sku: true,
              stock: true,
              isDefault: true,
              mrp: true,
              specifications: true,
            }
          },
          images: { orderBy: { sortOrder: 'asc' } },
          reviews: { select: { id: true, rating: true } },
          category: true,
        }
      });

      return products;
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
