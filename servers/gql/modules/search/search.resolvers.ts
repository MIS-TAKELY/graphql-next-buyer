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

      // ===== STEP 1: Recall (Vector + Keyword) =====
      let vector: number[] = [];
      let topProductIds: string[] = [];
      let useVectorSearch = true;

      // 1a. Try Vector Search
      try {
        vector = await generateEmbedding(query);
        const vectorString = `[${vector.join(",")}]`;

        console.log(`🔍 Vector search for "${query}" (${vector.length} dimensions)`);

        const vectorResults = await prisma.$queryRaw<
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

        console.log(`✅ Found ${vectorResults.length} products with embeddings`);
        topProductIds = vectorResults.map((p) => p.id);
      } catch (error) {
        console.error("❌ Vector search failed, falling back to keyword search:", error);
        useVectorSearch = false;
      }

      // 1b. Keyword Recall (Calculated using pg_trgm for fuzzy matching)
      let keywordIds: string[] = [];
      try {
        const fuzzyResults = await prisma.$queryRaw<Array<{ id: string; match_score: number }>>(
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
        console.log(`✅ Fuzzy search found ${fuzzyResults.length} matches for "${query}"`);
        keywordIds = fuzzyResults.map(p => p.id);
      } catch (error) {
        console.error("❌ Fuzzy search failed (pg_trgm likely missing), falling back to simple contains:", error);
        // Fallback to simple contains if fuzzy search fails
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
        keywordIds = keywordResults.map(p => p.id);
      }

      // Combine results: prioritize keyword/fuzzy matches then vector matches
      // Use a Set to handle duplicates
      const consolidatedIds = Array.from(new Set([...keywordIds, ...topProductIds]));

      // If we have keyword matches, we trust them more for specific terms like "laptep" -> "laptop"
      // So if keyword matches exist, we might want to rely less on the "bad" vector results for typos
      if (keywordIds.length > 0 && useVectorSearch) {
        console.log("ℹ️ Merging fuzzy matches with vector results");
      }

      // 1c. Apply 60% rule on the consolidated recall set
      // The user requested: "among all the matched result show only 60% of the product"
      if (consolidatedIds.length > 0) {
        const splitIndex = Math.ceil(consolidatedIds.length * 0.6);
        topProductIds = consolidatedIds.slice(0, splitIndex);
      } else {
        topProductIds = [];
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

      // Specifications (Only apply EXPLICIT user filters as hard constraints)
      // For AI intent, we should be more relaxed OR use them for sorting.
      // Here, we only apply spec filters if they were explicitly selected by the user.
      const userSpecFilters = filters?.specifications || {};

      for (const [key, value] of Object.entries(userSpecFilters)) {
        if (!value || (Array.isArray(value) && value.length === 0)) continue;
        // Skip brands and categories as they are handled separately
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
      // Reuse the filters from the first getDynamicFilters call (line 123)
      // to avoid expensive duplicate computation

      return {
        products: orderedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        filters: dynamicFiltersResult.filters,
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
