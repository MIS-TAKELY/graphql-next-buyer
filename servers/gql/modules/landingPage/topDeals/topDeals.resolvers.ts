import { Prisma } from "../../../../../app/generated/prisma";
import { detectCategory } from "@/filter/detectCategory";
import { prisma } from "../../../../../lib/db/prisma";
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

      // CLEAN THE QUERY: Remove "Best Deals on", "Top Offers", etc.
      // This ensures we search for "Furniture" instead of "Best Deals on Furniture"
      const cleanedQuery = topDealAbout
        .replace(/\b(best|top|deals?|offers?)\b/gi, "")
        .replace(/\b(on|for|at|in)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim();

      console.log(`🧹 Cleaned query: "${topDealAbout}" -> "${cleanedQuery}"`);

      // Step 1a: Try DIRECT exact category name match first (before AI detection)
      // This ensures "Smart phones" maps exactly to the "Smart phones" category
      // and avoids AI/Typesense cross-category contamination.
      let directCategory = await prisma.category.findFirst({
        where: {
          OR: [
            { name: { equals: cleanedQuery, mode: "insensitive" } },
            { slug: { equals: cleanedQuery.toLowerCase().replace(/\s+/g, "-"), mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true },
      });

      // Partial match fallback before AI
      if (!directCategory) {
        directCategory = await prisma.category.findFirst({
          where: { name: { contains: cleanedQuery, mode: "insensitive" } },
          select: { id: true, name: true },
        });
      }

      let detectedCategory: string;
      if (directCategory) {
        console.log(`✅ Direct category match: "${directCategory.name}" (ID: ${directCategory.id})`);
        detectedCategory = directCategory.name;
      } else {
        // Step 1b: Fall back to AI detection only if direct match fails
        const result = await detectCategory(cleanedQuery || topDealAbout);
        detectedCategory = result.category;
        console.log("🎯 AI Detected category:", detectedCategory);
      }

      // Step 2: Get the detected category from database
      // If we already found it via direct match, reuse it; otherwise query again.
      let category = directCategory ?? await prisma.category.findFirst({
        where: {
          OR: [
            {
              name: {
                equals: detectedCategory,
                mode: "insensitive",
              },
            },
            {
              slug: {
                equals: detectedCategory.toLowerCase().replace(/\s+/g, "-"),
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
        },
      });

      // If still not found, try a partial match
      if (!category) {
        category = await prisma.category.findFirst({
          where: {
            name: {
              contains: detectedCategory,
              mode: "insensitive",
            },
          },
          select: {
            id: true,
            name: true,
          },
        });
      }

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

      // Step 5: Typesense Search within the category hierarchy
      const { typesenseClient } = await import("@/lib/typesense");

      let searchParams: any = {
        q: cleanedQuery || '*',
        query_by: 'name,brand,description,categoryName',
        filter_by: `status:=ACTIVE && categoryId:[${categoryIds.join(',')}]`,
        per_page: 50,
      };

      let searchResult = await typesenseClient.collections('products').documents().search(searchParams);
      let hits = searchResult.hits || [];
      let productIds = hits.map((hit: any) => hit.document.id);

      // Step 7: Fetch full product details with proper typing
      let products = (await prisma.product.findMany({
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
            select: { id: true, rating: true },
          },
        },
      })) as ProductWithDetails[];

      // Fallback: If not enough results, fetch generic popular items from the category (Wildcard)
      if (products.length < limit) {
        console.log(
          `⚠️ Only found ${products.length} products with specific query. Fetching more via wildcard...`
        );

        searchParams.q = '*';
        // Note: Typesense doesn't support id:!=[...] filtering reliably. 
        // We fetch and then filter in memory later if needed, but per_page=50 is enough.

        const remainingLimit = 50;
        searchParams.per_page = remainingLimit;

        searchResult = await typesenseClient.collections('products').documents().search(searchParams);
        const fallbackHits = searchResult.hits || [];

        if (fallbackHits.length > 0) {
          const fallbackIds = fallbackHits.map((hit: any) => hit.document.id);
          console.log(`✅ Found ${fallbackHits.length} fallback products`);

          const fallbackProducts = (await prisma.product.findMany({
            where: {
              id: { in: fallbackIds },
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
                select: { id: true, rating: true },
              },
            },
          })) as ProductWithDetails[];

          products = [...products, ...fallbackProducts];
        }
      }

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
        // Sort by biggest savings (DESC) instead of smallest (ASC)
        .sort((a, b) => b.saveUpTo - a.saveUpTo)
        .slice(0, limit);

      await setCache(cacheKey, productsWithDeals, 86400);

      return productsWithDeals;
    },
  },
};
