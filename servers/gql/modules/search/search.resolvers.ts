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

      // ===== STEP 1: Vector Search (Recall) =====
      // Get top 100 products by semantic similarity
      let vector: number[] = [];
      let topProductIds: string[] = [];
      let useVectorSearch = true;

      try {
        vector = await generateEmbedding(query);
        const vectorString = `[${vector.join(",")}]`;

        const vectorResults = await prisma.$queryRaw<
          Array<{ id: string; category_id: string | null; similarity: number }>
        >(
          Prisma.sql`
            SELECT 
              id::text,
              "categoryId"::text as category_id,
              1 - (embedding <=> ${Prisma.raw(
            `'${vectorString}'::vector`
          )}) AS similarity
            FROM "products"
            WHERE embedding IS NOT NULL AND status = 'ACTIVE'
            ORDER BY similarity DESC
            LIMIT 100
          `
        );

        topProductIds = vectorResults.map((p) => p.id);
      } catch (error) {
        console.error("Vector search failed, falling back to keyword search:", error);
        useVectorSearch = false;

        // Fallback to keyword search
        const keywordResults = await prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { brand: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
            status: "ACTIVE",
          },
          select: { id: true },
          take: 100,
        });

        topProductIds = keywordResults.map((p) => p.id);
      }

      if (topProductIds.length === 0) {
        return {
          products: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
          filters: { brands: [], categories: [], specifications: {}, delivery: [] },
          intent: {},
          dominantCategory: null,
        };
      }

      // ===== STEP 2: Category Inference =====
      // Find dominant category from top results
      const categoryDistribution = await prisma.product.groupBy({
        by: ["categoryId"],
        where: {
          id: { in: topProductIds },
          categoryId: { not: null },
        },
        _count: true,
        orderBy: {
          _count: {
            categoryId: "desc",
          },
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

      // ===== STEP 3: Fetch CategorySpecification =====
      // Get dynamic filters for dominant category (hierarchical)
      const dynamicFiltersResult = await getDynamicFilters(
        query,
        filters?.specifications || {},
        topProductIds
      );

      const availableFilterKeys = dynamicFiltersResult.filters.map((f) => f.key);

      // ===== STEP 4: LLM Intent Extraction =====
      // Extract structured intent from query (controlled, JSON-only)
      const intent = await extractIntent(query, availableFilterKeys);

      // ===== STEP 5: Structured Filtering =====
      // Apply filters from intent + user selections
      const whereConditions: string[] = [
        `id = ANY($1)`, // Must be in top 100 from vector search
        `status = 'ACTIVE'`,
      ];
      const params: any[] = [topProductIds];

      // Apply category filter
      if (filters?.categories?.length) {
        whereConditions.push(`"categoryId" = ANY($${params.length + 1})`);
        params.push(filters.categories);
      }

      // Apply brand filter (from user OR intent)
      const brandFilter = filters?.brands || intent.brand;
      if (brandFilter?.length) {
        whereConditions.push(`brand = ANY($${params.length + 1})`);
        params.push(brandFilter);
      }

      // Apply price filter (from user OR intent)
      const priceMax = filters?.maxPrice || intent.price_max;
      const priceMin = filters?.minPrice || intent.price_min;

      if (priceMax || priceMin) {
        const priceConditions: string[] = [];
        if (priceMax) {
          priceConditions.push(`pv.price <= $${params.length + 1}`);
          params.push(priceMax);
        }
        if (priceMin) {
          priceConditions.push(`pv.price >= $${params.length + 1}`);
          params.push(priceMin);
        }

        whereConditions.push(`EXISTS (
          SELECT 1 FROM "product_variants" pv 
          WHERE pv."productId" = products.id 
          AND ${priceConditions.join(" AND ")}
        )`);
      }

      // Apply specification filters (from user OR intent)
      const specFilters = { ...intent.specifications, ...filters?.specifications };

      for (const [key, value] of Object.entries(specFilters)) {
        if (!value || (Array.isArray(value) && value.length === 0)) continue;

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

      // Apply stock filter
      if (filters?.inStock) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM "product_variants" pv 
          WHERE pv."productId" = products.id AND pv.stock > 0
        )`);
      }

      const whereClause = whereConditions.join(" AND ");

      // Get total count using $queryRawUnsafe
      const countQuery = `SELECT COUNT(*) as count FROM "products" WHERE ${whereClause}`;
      const countResult = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
        countQuery,
        ...params
      );

      const total = Number(countResult[0]?.count || 0);
      const totalPages = Math.ceil(total / limit);

      // ===== STEP 6: Final Ranking =====
      // Semantic relevance + Business metrics (popularity + trust)
      let orderByClause = "";
      if (useVectorSearch && vector.length > 0) {
        const vectorString = `[${vector.join(",")}]`;
        orderByClause = `embedding <=> '${vectorString}'::vector, "soldCount" DESC, "averageRating" DESC`;
      } else {
        orderByClause = `"soldCount" DESC, "averageRating" DESC, "createdAt" DESC`;
      }

      // Build final query with pagination
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

      // Maintain ranking order
      const productMap = new Map(products.map((p) => [p.id, p]));
      const orderedProducts = productIds
        .map((id) => productMap.get(id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
        .map((p) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        }));

      // ===== Dynamic Facet Counts =====
      // Get filter counts for UI (Amazon-style)
      // Use topProductIds (all search results) instead of productIds (paginated)
      // This ensures filters show all available options, not just from current page
      const allFilteredIds = rankedResults.map((p) => p.id);

      const filterCounts = await getDynamicFilters(
        query,
        filters?.specifications || {},
        allFilteredIds.length > 0 ? allFilteredIds : topProductIds
      );

      return {
        products: orderedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        filters: filterCounts.filters,
        intent,
        dominantCategory: dominantCategoryName,
      };
    },

    searchSuggestions: async (_: any, { query }: { query: string }) => {
      if (!query.trim()) {
        // Return popular categories or terms if query is empty
        return [
          "phones",
          "laptops",
          "home decor",
          "fashion",
          "electronics",
          "books",
        ];
      }

      // Generate vector embedding for the query
      const vector = await generateEmbedding(query);
      const vectorString = `[${vector.join(",")}]`;

      // Query for top matching products based on embedding similarity
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

      // Extract unique suggestions from product names, categories, and brands
      const suggestions = new Set<string>();
      results.forEach((result) => {
        if (result.name) suggestions.add(result.name.toLowerCase());
        if (result.categoryName)
          suggestions.add(result.categoryName.toLowerCase());
        if (result.brand) suggestions.add(result.brand.toLowerCase());
      });

      // Convert Set to Array and filter out duplicates
      return Array.from(suggestions).slice(0, 6);
    },
  },
};
