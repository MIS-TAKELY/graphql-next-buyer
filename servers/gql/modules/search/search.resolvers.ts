import { Prisma } from "../../../../app/generated/prisma";
import { prisma } from "../../../../lib/db/prisma";
import { typesenseClient } from "@/lib/typesense";
import { extractIntent, extractIntentWithLLM, mapCategoryToDB } from "@/lib/search/intentExtractor";
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
      try {
        console.log(`🔍 Search Query: "${query}"`);
        const startTime = Date.now();

        // 0. Extract Intent (Fast First)
        let intent = await extractIntent(query);

        // If query is complex or intent is sparse, fallback to LLM
        if (query.split(' ').length > 3 && (!intent.category || !intent.brand)) {
          console.log("🧠 Falling back to LLM for deeper intent extraction...");
          const llmIntent = await extractIntentWithLLM(query);
          intent = { ...intent, ...llmIntent };
        }

        const searchTerms = intent.correctedQuery || query;
        console.log(`🤖 Final Intent: ${JSON.stringify(intent)}`);

        // 1. Get Keywords Search (Typesense)
        let typesenseIds: string[] = [];
        try {
          const filterConditions: string[] = ['status:=ACTIVE'];
          if (filters?.categories?.length) {
            const categoryFilters = filters.categories.map((c: string) => `categoryId:=${c}`).join(' || ');
            filterConditions.push(`(${categoryFilters})`);
          }
          if (filters?.brands?.length) {
            const brandFilters = filters.brands.map((b: string) => `brand:=${b}`).join(' || ');
            filterConditions.push(`(${brandFilters})`);
          }
          if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
            const min = filters.minPrice || 0;
            const max = filters.maxPrice || 999999999;
            filterConditions.push(`price:[${min}..${max}]`);
          }

          let dbCategoryName = null;
          if (intent.category) {
            dbCategoryName = await mapCategoryToDB(intent.category);
            if (dbCategoryName) {
              console.log(`📂 Mapped intent category "${intent.category}" to "${dbCategoryName}"`);
            }
          }

          if (dbCategoryName) {
            filterConditions.push(`categoryName:="${dbCategoryName}"`);
          }
          if (intent.brand?.length) {
            const intentBrandFilters = intent.brand.map((b: string) => `brand:="${b}"`).join(' || ');
            filterConditions.push(`(${intentBrandFilters})`);
          }
          if (intent.price_min !== undefined) {
            filterConditions.push(`price:>=${intent.price_min}`);
          }
          if (intent.price_max !== undefined) {
            filterConditions.push(`price:<=${intent.price_max}`);
          }

          const searchParams: any = {
            q: searchTerms,
            query_by: 'name,brand,description,categoryName',
            query_by_weights: '4,3,2,1',
            prefix: true,
            page: 1,
            per_page: 50,
            filter_by: filterConditions.join(' && '),
          };

          let typesenseResult = await typesenseClient.collections('products').documents().search(searchParams);

          // Fallback if automated category filter is too restrictive
          if (typesenseResult.found === 0 && dbCategoryName && !filters?.categories?.length) {
            console.log("⚠️ Typesense: No results with category filter, retrying without it...");
            const broaderFilters = filterConditions.filter(f => !f.startsWith('categoryName:'));
            searchParams.filter_by = broaderFilters.join(' && ');
            typesenseResult = await typesenseClient.collections('products').documents().search(searchParams);
          }

          typesenseIds = (typesenseResult.hits || []).map((hit: any) => hit.document.id);
        } catch (e) {
          console.error("Typesense error in Hybrid Search:", e);
        }

        // 2. Get Semantic Search (Vector)
        let vectorIds: string[] = [];
        try {
          const { getEmbedding } = await import("@/lib/search/embedding");
          const embedding = await getEmbedding(query);
          const vectorString = `[${embedding.join(",")}]`;

          // Build dynamic where clause for Postgres
          const whereConditions = ["status = 'ACTIVE'"];
          const params: any[] = [vectorString];

          if (filters?.categories?.length) {
            params.push(filters.categories);
            whereConditions.push(`"categoryId" = ANY($${params.length})`);
          }
          if (filters?.brands?.length) {
            params.push(filters.brands);
            whereConditions.push(`brand = ANY($${params.length})`);
          }

          if (intent.category) {
            const category = await prisma.category.findFirst({
              where: { name: { contains: intent.category, mode: 'insensitive' } },
              select: { id: true }
            });
            if (category) {
              params.push(category.id);
              whereConditions.push(`"categoryId" = $${params.length}`);
            }
          }
          if (intent.brand?.length) {
            params.push(intent.brand);
            whereConditions.push(`brand = ANY($${params.length})`);
          }
          // Note: price is in ProductVariant, so we can't easily filter in raw product query without JOIN
          // Typesense already handles price filtering, which is used for the keyword side of hybrid search.

          let rawResults = await prisma.$queryRawUnsafe<any[]>(
            `SELECT id FROM products WHERE ${whereConditions.join(' AND ')} ORDER BY embedding <=> $1::vector LIMIT 50`,
            ...params
          );

          // Fallback for Vector search
          if (rawResults.length === 0 && intent.category && !filters?.categories?.length) {
            console.log("⚠️ Vector: No results with category filter, retrying without it...");
            const broaderConditions = whereConditions.filter(c => !c.includes('categoryId'));
            // Filter out the category ID from params if possible, but it's easier to just rebuild or just let it be
            // For simplicity, we'll just skip the fallback for now or do a simpler query
            rawResults = await prisma.$queryRawUnsafe<any[]>(
              `SELECT id FROM products WHERE status = 'ACTIVE' ORDER BY embedding <=> $1::vector LIMIT 50`,
              vectorString
            );
          }
          vectorIds = rawResults.map(r => r.id);
        } catch (e) {
          console.error("Vector search error in Hybrid Search:", e);
        }

        // 3. Reciprocal Rank Fusion (RRF)
        const k = 60;
        const scoreMap = new Map<string, number>();

        const applyRRF = (ids: string[]) => {
          ids.forEach((id, index) => {
            const rank = index + 1;
            const score = 1 / (rank + k);
            scoreMap.set(id, (scoreMap.get(id) || 0) + score);
          });
        };

        applyRRF(typesenseIds);
        applyRRF(vectorIds);

        // Sort by RRF score
        const sortedIds = Array.from(scoreMap.entries())
          .sort((a, b) => b[1] - a[1])
          .map(entry => entry[0]);

        const total = sortedIds.length;
        const totalPages = Math.ceil(total / limit);
        const paginatedIds = sortedIds.slice((page - 1) * limit, page * limit);

        if (paginatedIds.length === 0) {
          return {
            products: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
            filters: [],
            intent: intent,
            dominantCategory: intent.category || null,
          };
        }

        // 4. Fetch full data
        const products = await prisma.product.findMany({
          where: { id: { in: paginatedIds } },
          include: {
            variants: { include: { specifications: true } },
            images: { orderBy: { sortOrder: "asc" } },
            reviews: { select: { rating: true } },
            category: true,
            deliveryOptions: true,
          },
        });

        // 5. Restore RRF Order
        const productMap = new Map(products.map((p) => [p.id, p]));
        const orderedProducts = paginatedIds
          .map((id) => productMap.get(id))
          .filter((p): p is NonNullable<typeof p> => Boolean(p))
          .map((p) => ({
            ...p,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
          }));

        // Get Dynamic Filters using top RRF results
        const dynamicFiltersResult = await getDynamicFilters(
          query,
          filters || {},
          intent
        );

        return {
          products: orderedProducts,
          pagination: { page, limit, total, totalPages },
          filters: dynamicFiltersResult.filters,
          intent: intent,
          dominantCategory: intent.category || null,
        };

      } catch (e) {
        console.error("Hybrid Search overall failure:", e);
        return {
          products: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
          filters: [],
          intent: {},
          dominantCategory: null,
        };
      }
    },

    searchSuggestions: async (_: any, { query }: { query: string }) => {
      if (!query || query.length < 2) return [];

      try {
        // First try Typesense for prefix matching
        const searchResult = await typesenseClient.collections('products').documents().search({
          q: query,
          query_by: 'name,brand,categoryName',
          prefix: true,
          per_page: 10,
          include_fields: 'name,brand,categoryName'
        });

        const suggestions = new Set<string>();

        // Add exact matches or prefix matches from Typesense
        searchResult.hits?.forEach((hit: any) => {
          if (hit.document.name) suggestions.add(hit.document.name);
          if (hit.document.brand) suggestions.add(hit.document.brand);
          if (hit.document.categoryName) suggestions.add(`In ${hit.document.categoryName}`);
        });

        // If we have few suggestions, ask LLM for alternatives
        if (suggestions.size < 3) {
          const { callLLM } = await import("@/lib/search/llm");
          const prompt = `Give 5 popular search suggestions for e-commerce starting with or related to "${query}". Return ONLY a JSON array of strings.`;
          try {
            const llmResponse = await callLLM(prompt);
            const llmSuggestions = JSON.parse(llmResponse);
            if (Array.isArray(llmSuggestions)) {
              llmSuggestions.forEach(s => suggestions.add(s));
            }
          } catch (e) {
            console.error("LLM Suggestion Error:", e);
          }
        }

        return Array.from(suggestions).slice(0, 8);
      } catch (e) {
        console.error("Search Suggestion Error:", e);
        return [];
      }
    },
  },
};
