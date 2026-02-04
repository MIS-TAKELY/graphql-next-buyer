import { Prisma } from "../../../../app/generated/prisma";
import { prisma } from "../../../../lib/db/prisma";
import { generateEmbedding } from "@/lib/embemdind";
import { extractIntent } from "@/lib/search/intentExtractor";
import { getDynamicFilters } from "@/filter/getFilters";

export const searchResolvers = {
  Query: {
    searchProducts: async (
      _: any,
      {
        query,
        filters,
        page = 1,
        limit = 10,
      }: {
        query: string;
        filters: any;
        page: number;
        limit: number;
      }
    ) => {
      const offset = (page - 1) * limit;

      // ===== STEP 0: Early Intent Extraction (Crucial for typos like "sansang" -> "Samsung") =====
      // We need to know if the user *meant* a specific brand before we search.
      let explicitBrandIntent: string[] = [];
      try {
        const intent = await extractIntent(query);
        if (intent.brand && intent.brand.length > 0) {
          explicitBrandIntent = intent.brand;
          console.log(`🚀 Early Brand Detection: ${explicitBrandIntent.join(", ")}`);
        }
      } catch (e) {
        console.error("Early intent extraction failed:", e);
      }

      // Map to store combined scores: inputId -> { vectorScore, fuzzyScore, ... }
      const productScores = new Map<
        string,
        { id: string; vectorScore: number; fuzzyScore: number; combinedScore: number }
      >();

      // Helper to update scores
      const updateScore = (id: string, type: 'vector' | 'fuzzy', score: number) => {
        if (!productScores.has(id)) {
          productScores.set(id, { id, vectorScore: 0, fuzzyScore: 0, combinedScore: 0 });
        }
        const entry = productScores.get(id)!;
        if (type === 'vector') entry.vectorScore = score;
        if (type === 'fuzzy') entry.fuzzyScore = score;

        // precise "laaptopt" -> "laptop" matching needs fuzzy to be strong,
        // but "l" -> "lattafa" needs vector to be weak.
        // Hybrid Score: Max(Vector, Fuzzy)
        // We trust a strong signal from EITHER source.
        // If vector is high (semantic match), good.
        // If fuzzy is high (typo match), good.
        entry.combinedScore = Math.max(entry.vectorScore, entry.fuzzyScore);
      };

      // 1. Parallel execution of Vector and Fuzzy Search
      let vectorFound = false;
      let fuzzyFound = false;
      let vectorEmbedding: number[] = [];

      try {
        // Run all searches concurrently
        const results = await Promise.allSettled([
          // Task A: Vector Search
          (async () => {
            // ... existing vector search logic ... 
            // RE-INLINING for clarity since we are replacing the block
            try {
              const vector = await generateEmbedding(query);
              vectorEmbedding = vector;
              const vectorString = `[${vector.join(",")}]`;
              console.log(`🔍 Vector search for "${query}"`);

              return await prisma.$queryRaw<
                Array<{ id: string; similarity: number }>
              >(
                Prisma.sql`
                  SELECT 
                    id::text,
                    1 - (embedding <=> ${Prisma.raw(`'${vectorString}'::vector`)}) AS similarity
                  FROM "products"
                  WHERE embedding IS NOT NULL AND status = 'ACTIVE'
                  ORDER BY similarity DESC
                  LIMIT 100
                `
              );
            } catch (e) {
              console.error("Vector search error:", e);
              return [];
            }
          })(),

          // Task B: Fuzzy Search
          (async () => {
            try {
              return await prisma.$transaction(async (tx) => {
                // Increased threshold to 0.15 to reduce garbage matches
                await tx.$executeRawUnsafe(`SELECT set_limit(0.15);`);

                return await tx.$queryRaw<Array<{ id: string; match_score: number }>>(
                  Prisma.sql`
                    SELECT 
                      id,
                      GREATEST(
                        similarity(name, ${query}), 
                        similarity(brand, ${query}), 
                        similarity(description, ${query})
                      ) as match_score
                    FROM "products"
                    WHERE status = 'ACTIVE'
                      AND (
                        name % ${query} 
                        OR brand % ${query} 
                        OR description % ${query}
                      )
                    ORDER BY match_score DESC
                    LIMIT 100;
                  `
                );
              });
            } catch (e) {
              console.error("Fuzzy search error:", e);
              // Fallback to simple contains
              const simpleMatches = await prisma.product.findMany({
                where: {
                  status: "ACTIVE",
                  OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { brand: { contains: query, mode: "insensitive" } },
                  ]
                },
                select: { id: true },
                take: 50
              });
              return simpleMatches.map(p => ({ id: p.id, match_score: 1.0 }));
            }
          })(),

          // Task C: Brand Boost (If intent detected)
          (async () => {
            if (explicitBrandIntent.length === 0) return [];
            console.log(`🔥 Boosting brands: ${explicitBrandIntent.join(", ")}`);
            try {
              const boostedProducts = await prisma.product.findMany({
                where: {
                  status: 'ACTIVE',
                  brand: { in: explicitBrandIntent, mode: 'insensitive' }
                },
                select: { id: true },
                take: 50 // Boost top 50 products from this brand
              });
              return boostedProducts.map(p => ({ id: p.id, boost_score: 0.95 }));
            } catch (e) {
              console.error("Brand boost error:", e);
              return [];
            }
          })()
        ]);

        // Process Vector Results
        if (results[0].status === 'fulfilled' && results[0].value.length > 0) {
          results[0].value.forEach(p => updateScore(p.id, 'vector', p.similarity));
          vectorFound = true;
          console.log(`✅ Vector found ${results[0].value.length} items`);
        }

        // Process Fuzzy Results
        if (results[1].status === 'fulfilled' && results[1].value.length > 0) {
          results[1].value.forEach(p => updateScore(p.id, 'fuzzy', p.match_score));
          fuzzyFound = true;
          console.log(`✅ Fuzzy found ${results[1].value.length} items`);
        }

        // Process Brand Boost Results
        if (results[2] && results[2].status === 'fulfilled' && results[2].value.length > 0) {
          results[2].value.forEach(p => {
            // We treat brand match as a very high fuzzy score (effectively)
            // Overwrite or max out the score
            if (!productScores.has(p.id)) {
              productScores.set(p.id, { id: p.id, vectorScore: 0, fuzzyScore: 0, combinedScore: 0 });
            }
            const entry = productScores.get(p.id)!;
            // Boost score ensures it competes with high vector/fuzzy scores
            entry.fuzzyScore = Math.max(entry.fuzzyScore, p.boost_score);
            entry.combinedScore = Math.max(entry.combinedScore, p.boost_score);
          });
          console.log(`✅ Brand Boost added ${results[2].value.length} items`);
        }

      } catch (error) {
        console.error("Search execution failed:", error);
      }

      // Convert map to array and sort by combined score
      let allCandidates = Array.from(productScores.values())
        .sort((a, b) => b.combinedScore - a.combinedScore);

      console.log(`📊 Total unique candidates: ${allCandidates.length}`);
      if (allCandidates.length > 0) {
        console.log(`🏆 Top Candidate: ${allCandidates[0].id} (Score: ${allCandidates[0].combinedScore.toFixed(2)})`);
      }

      // 60% Slicing Rule (only if we have enough results)
      let topProductIds = allCandidates.map(c => c.id);
      if (topProductIds.length > 10) {
        // Keep top 60% of matches if we have a lot, but ensure at least 10 or 20
        const keepCount = Math.max(10, Math.ceil(topProductIds.length * 0.6));
        topProductIds = topProductIds.slice(0, keepCount);
      }

      if (topProductIds.length === 0) {
        return {
          products: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
          filters: [],
          intent: {},
          dominantCategory: null,
        };
      }

      // ===== STEP 2: Category Inference =====
      const categoryDistribution = await prisma.product.groupBy({
        by: ["categoryId"],
        where: {
          id: { in: topProductIds },
          categoryId: { not: null },
        },
        _count: true,
        orderBy: {
          _count: { categoryId: "desc" },
        },
        take: 1,
      });

      const dominantCategoryId = categoryDistribution[0]?.categoryId;
      let dominantCategoryName = "All Products";

      if (dominantCategoryId) {
        const category = await prisma.category.findUnique({
          where: { id: dominantCategoryId },
          select: { name: true },
        });
        dominantCategoryName = category?.name || "All Products";
      }

      // ===== STEP 3: Fetch Dynamic Filters =====
      const dynamicFiltersResult = await getDynamicFilters(
        query,
        filters?.specifications || {},
        topProductIds
      );

      const availableFilterKeys = dynamicFiltersResult.filters.map((f) => f.key);

      // ===== STEP 4: LLM Intent Extraction =====
      const intent = await extractIntent(query, availableFilterKeys);

      // ===== STEP 5: Final Filtering (Dynamic) =====
      const whereConditions: string[] = [
        `id = ANY($1)`,
        `status = 'ACTIVE'`,
      ];
      const params: any[] = [topProductIds];

      // Categories
      if (filters?.categories?.length) {
        whereConditions.push(`"categoryId" = ANY($${params.length + 1})`);
        params.push(filters.categories);
      }

      // Brand (ONLY apply explicit user selection as hard constraints)
      const brandFilter = filters?.brands || [];
      if (brandFilter.length > 0) {
        whereConditions.push(`brand = ANY($${params.length + 1})`);
        params.push(brandFilter);
      }

      // Price (ONLY apply explicit user selection as hard constraints)
      const priceMax = filters?.maxPrice;
      const priceMin = filters?.minPrice;

      if (priceMax !== undefined || priceMin !== undefined) {
        const priceConditions: string[] = [];
        if (priceMax !== undefined) {
          priceConditions.push(`pv.price <= $${params.length + 1}`);
          params.push(priceMax);
        }
        if (priceMin !== undefined) {
          priceConditions.push(`pv.price >= $${params.length + 1}`);
          params.push(priceMin);
        }

        whereConditions.push(`EXISTS (
          SELECT 1 FROM "product_variants" pv 
          WHERE pv."productId" = products.id 
          AND ${priceConditions.join(" AND ")}
        )`);
      }

      // Specifications
      const userSpecFilters = filters?.specifications || {};
      for (const [key, value] of Object.entries(userSpecFilters)) {
        if (!value || (Array.isArray(value) && value.length === 0)) continue;
        if (key === 'brand' || key === 'categories') continue;

        const values = Array.isArray(value) ? value : [value];
        whereConditions.push(`EXISTS (
          SELECT 1 FROM "product_variants" pv
          JOIN "product_specifications" ps ON ps."variantId" = pv.id
          WHERE pv."productId" = products.id
          AND ps.key = $${params.length + 1}
          AND ps.value = ANY($${params.length + 2})
        )`);
        params.push(key, values);
      }

      const whereClause = whereConditions.join(" AND ");

      // Get count
      const countQuery = `SELECT COUNT(*) as count FROM "products" WHERE ${whereClause}`;
      const countResult = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
        countQuery,
        ...params
      );

      const total = Number(countResult[0]?.count || 0);
      const totalPages = Math.ceil(total / limit);

      // ===== STEP 6: Final Ranking =====
      // We want to preserve the relevance ranking we calculated in validCandidates.
      // However, the final SQL user query applies filtering (price, brand) which might reduce the set.
      // The simplest way to respect relevance order is to pass the filtered IDs in order.
      // But we can't easily do `ORDER BY user_provided_array_order` without complex SQL.

      // Instead, we will fallback to standard business metrics sort, OR uses vector similarity if available.
      // Since we already did a heavy pre-filter/rank in Step 1, the topProductIds are already "good".
      // But `WHERE id = ANY(...)` doesn't preserve order.

      let orderByClause = "";
      // If we have a vector, use it for fine-grained ranking within the top N candidates
      if (vectorEmbedding.length > 0) {
        const vectorString = `[${vectorEmbedding.join(",")}]`;
        orderByClause = `embedding <=> '${vectorString}'::vector, "soldCount" DESC, "averageRating" DESC`;
      } else {
        // Fallback to popularity
        orderByClause = `"soldCount" DESC, "averageRating" DESC, "createdAt" DESC`;
      }

      const selectQuery = `
        SELECT id::text 
        FROM "products" 
        WHERE ${whereClause}
        ORDER BY ${orderByClause}
        LIMIT $${params.length + 1}
        OFFSET $${params.length + 2}
      `;

      const rankedResults = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
        selectQuery,
        ...params,
        limit,
        offset
      );

      const productIds = rankedResults.map((p) => p.id);

      // Fetch full product data
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: {
          variants: {
            select: {
              price: true,
              mrp: true,
              specifications: {
                select: {
                  key: true,
                  value: true,
                },
              },
            },
          },
          images: {
            select: {
              url: true,
              altText: true,
              sortOrder: true,
            },
            orderBy: { sortOrder: "asc" },
          },
          reviews: {
            select: { rating: true },
          },
          category: true,
          deliveryOptions: true,
        },
      });

      // Maintain ranking order from the SQL query
      const productMap = new Map(products.map((p) => [p.id, p]));
      const orderedProducts = productIds
        .map((id) => productMap.get(id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
        .map((p) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        }));

      return {
        products: orderedProducts,
        pagination: { page, limit, total, totalPages },
        filters: dynamicFiltersResult.filters,
        intent,
        dominantCategory: dominantCategoryName,
      };
    },

    searchSuggestions: async (_: any, { query }: { query: string }) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        return [
          "phones",
          "laptops",
          "home decor",
          "fashion",
          "electronics",
          "books",
        ];
      }

      // Optimization for short queries: Skip vector search if length < 3
      if (trimmedQuery.length < 3) {
        console.log(`⚡ Short query "${trimmedQuery}", using simple prefix match`);
        const prefixResults = await prisma.product.findMany({
          where: {
            OR: [
              { name: { startsWith: trimmedQuery, mode: 'insensitive' } },
              { brand: { startsWith: trimmedQuery, mode: 'insensitive' } },
              { category: { name: { startsWith: trimmedQuery, mode: 'insensitive' } } }
            ],
            status: 'ACTIVE'
          },
          select: {
            name: true,
            brand: true,
            category: { select: { name: true } }
          },
          take: 5
        });

        const suggestions = new Set<string>();
        prefixResults.forEach(p => {
          if (p.name.toLowerCase().startsWith(trimmedQuery.toLowerCase())) suggestions.add(p.name);
          if (p.brand.toLowerCase().startsWith(trimmedQuery.toLowerCase())) suggestions.add(p.brand);
          if (p.category?.name.toLowerCase().startsWith(trimmedQuery.toLowerCase())) suggestions.add(p.category.name);
        });
        return Array.from(suggestions).slice(0, 6);
      }

      // Vector Embedding + Fuzzy for longer queries
      try {
        const vector = await generateEmbedding(trimmedQuery);
        const vectorString = `[${vector.join(",")}]`;

        const results = await prisma.$queryRaw<
          Array<{
            name: string;
            categoryName: string;
            brand: string;
            similarity: number;
          }>
        >(
          Prisma.sql`
            SELECT
              p.name,
              c.name as categoryName,
              p.brand,
              1 - (p.embedding <=> ${Prisma.raw(
            `'${vectorString}'::vector`
          )}) AS similarity
            FROM "products" p
            LEFT JOIN "categories" c ON p."categoryId" = c.id
            WHERE p.embedding IS NOT NULL AND p.status = 'ACTIVE'
            ORDER BY similarity DESC
            LIMIT 6
          `
        );

        const suggestions = new Set<string>();
        results.forEach((result) => {
          if (result.name) suggestions.add(result.name);
          if (result.brand) suggestions.add(result.brand);
        });

        return Array.from(suggestions).slice(0, 6);
      } catch (e) {
        return [];
      }
    },
  },
};
