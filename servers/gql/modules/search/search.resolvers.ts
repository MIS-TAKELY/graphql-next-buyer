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
      const offset = (page - 1) * limit;

      try {
        console.log(`🔍 Typesense Search: "${query}"`);

        // Build Typesense Search Parameters
        const searchParams: any = {
          q: query,
          query_by: 'name,brand,description,categoryName',
          query_by_weights: '4,3,2,1', // Name is most important
          prefix: true, // Auto-complete behavior
          page: page,
          per_page: limit,
          filter_by: 'status:=ACTIVE',
          sort_by: 'soldCount:desc,_text_match:desc', // Default sort
        };

        // Apply Filters
        const filterConditions: string[] = ['status:=ACTIVE'];

        // Categories
        if (filters?.categories?.length) {
          const categoryFilters = filters.categories.map((c: string) => `categoryId:=${c}`).join(' || ');
          filterConditions.push(`(${categoryFilters})`);
        }

        // Brands
        if (filters?.brands?.length) {
          const brandFilters = filters.brands.map((b: string) => `brand:=${b}`).join(' || ');
          filterConditions.push(`(${brandFilters})`);
        }

        // Price
        if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
          const min = filters.minPrice || 0;
          const max = filters.maxPrice || 999999999;
          filterConditions.push(`price:[${min}..${max}]`);
        }

        // Dynamic Specifications (Need to support this in Typesense schema if we want to filter by them)
        // For now, we will handle basic filters.
        // If specifications are critical, we need to add them to 'product_specifications' in Typesense schema.

        if (filterConditions.length > 0) {
          searchParams.filter_by = filterConditions.join(' && ');
        }

        // Execute Search
        const searchResult = await typesenseClient.collections('products').documents().search(searchParams);

        const hits = searchResult.hits || [];
        const total = searchResult.found;
        const totalPages = Math.ceil(total / limit);

        // Map hits to IDs
        const productIds = hits.map((hit: any) => hit.document.id);

        if (productIds.length === 0) {
          return {
            products: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
            filters: [],
            intent: {},
            dominantCategory: null,
          };
        }

        // Fetch full product data from DB (to ensure fresh data)
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          include: {
            variants: {
              include: {
                specifications: true
              }
            },
            images: {
              orderBy: { sortOrder: "asc" },
            },
            reviews: {
              select: { rating: true },
            },
            category: true,
            deliveryOptions: true,
          },
        });

        // Maintain Typesense Ranking Order
        const productMap = new Map(products.map((p) => [p.id, p]));
        const orderedProducts = productIds
          .map((id) => productMap.get(id))
          .filter((p): p is NonNullable<typeof p> => Boolean(p))
          .map((p) => ({
            ...p,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
          }));

        // Get Dynamic Filters (We can use facets from Typesense later for optimization)
        // For now, keep existing logic but feed it the top candidates
        const dynamicFiltersResult = await getDynamicFilters(
          query,
          filters?.specifications || {},
          productIds
        );

        return {
          products: orderedProducts,
          pagination: { page, limit, total, totalPages },
          filters: dynamicFiltersResult.filters,
          intent: {}, // can hook up intent extraction if needed
          dominantCategory: null, // can derive from facets
        };

      } catch (e) {
        console.error("Typesense Search Error:", e);
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
