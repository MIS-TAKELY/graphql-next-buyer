import { Prisma } from "@/app/generated/prisma";
import { prisma } from "@/lib/db/prisma";
import { generateEmbedding } from "@/lib/embemdind";

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

      // ✅ Step 1: Generate vector embedding
      const vector = await generateEmbedding(query);
      const vectorString = `[${vector.join(",")}]`;

      // ✅ Step 2: Build WHERE conditions dynamically
      const whereConditions: string[] = ["embedding IS NOT NULL"];
      const params: any[] = [];

      if (filters?.categories?.length) {
        whereConditions.push(`"categoryId" = ANY($${params.length + 1})`);
        params.push(filters.categories);
      }

      if (filters?.brands?.length) {
        whereConditions.push(`brand = ANY($${params.length + 1})`);
        params.push(filters.brands);
      }

      if (filters?.sellerId) {
        whereConditions.push(`"sellerId" = $${params.length + 1}`);
        params.push(filters.sellerId);
      }

      if (filters?.inStock) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM "product_variants" pv 
          WHERE pv."productId" = products.id AND pv.stock > 0
        )`);
      }

      const whereClause = whereConditions.join(" AND ");

      // ✅ Step 3: Get total count
      const countResult = await prisma.$queryRaw<Array<{ count: bigint }>>(
        Prisma.sql`
          SELECT COUNT(*) as count
          FROM "products"
          WHERE ${Prisma.raw(whereClause)}
        `
      );

      const total = Number(countResult[0]?.count || 0);
      const totalPages = Math.ceil(total / limit);

      // ✅ Step 4: Fetch top product IDs (semantic relevance)
      const idResults = await prisma.$queryRaw<
        Array<{ id: string; similarity: number }>
      >(
        Prisma.sql`
          SELECT 
            id::text,
            1 - (embedding <=> ${Prisma.raw(
          `'${vectorString}'::vector`
        )}) AS similarity
          FROM "products"
          WHERE ${Prisma.raw(whereClause)}
          ORDER BY similarity DESC
          LIMIT ${limit}
          OFFSET ${offset}
        `
      );

      if (idResults.length === 0) {
        return {
          products: [],
          pagination: { page, limit, total, totalPages },
        };
      }

      const productIds = idResults.map((p) => p.id);

      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: {
          variants: {
            select: {
              price: true,
              mrp: true,

              specifications: {
                select: {
                  value: true,
                },
              },
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
          deliveryOptions: true,
        },
      });

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
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
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
          WHERE p.embedding IS NOT NULL
          ORDER BY similarity DESC
          LIMIT 6
        `
      );

      // console.log("results-->",results)


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
