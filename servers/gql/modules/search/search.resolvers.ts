import { Prisma } from "../../../../app/generated/prisma";
import { prisma } from "../../../../lib/db/prisma";
import { typesenseClient } from "@/lib/typesense";
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
      try {
        console.log(`🔍 Hybrid Search: "${query}"`);

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

          const searchParams: any = {
            q: query,
            query_by: 'name,brand,description,categoryName',
            query_by_weights: '4,3,2,1',
            prefix: true,
            page: 1,
            per_page: 50,
            filter_by: filterConditions.join(' && '),
          };

          const typesenseResult = await typesenseClient.collections('products').documents().search(searchParams);
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

          const rawResults = await prisma.$queryRawUnsafe<any[]>(
            `SELECT id FROM products WHERE ${whereConditions.join(' AND ')} ORDER BY embedding <=> $1::vector LIMIT 50`,
            ...params
          );
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
            intent: {},
            dominantCategory: null,
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
          filters?.specifications || {},
          sortedIds.slice(0, 100) // Pass top 100 for better filter quality
        );

        return {
          products: orderedProducts,
          pagination: { page, limit, total, totalPages },
          filters: dynamicFiltersResult.filters,
          intent: {},
          dominantCategory: null,
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
        const searchResult = await typesenseClient.collections('products').documents().search({
          q: query,
          query_by: 'name,brand',
          prefix: true,
          per_page: 6,
          include_fields: 'name,brand'
        });

        const suggestions = new Set<string>();
        searchResult.hits?.forEach((hit: any) => {
          suggestions.add(hit.document.name);
          suggestions.add(hit.document.brand);
        });

        return Array.from(suggestions).slice(0, 6);
      } catch (e) {
        console.error("Typesense Suggestion Error:", e);
        return [];
      }
    },
  },
};
