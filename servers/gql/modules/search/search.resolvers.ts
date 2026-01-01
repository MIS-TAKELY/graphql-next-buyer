import { Prisma } from "../../../../app/generated/prisma";
import { prisma } from "../../../../lib/db/prisma";
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
      const whereConditions: string[] = ["embedding IS NOT NULL", "status = 'ACTIVE'"];
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

      const productIds = idResults.map((p: any) => p.id);

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
            },
          },
          reviews: {
            select: { rating: true },
          },
          category: true,
          deliveryOptions: true,
        },
      });

      const productMap = new Map(products.map((p: any) => [p.id, p]));
      const orderedProducts = productIds
        .map((id: any) => productMap.get(id))
        .filter((p: any): p is NonNullable<typeof p> => Boolean(p))
        .map((p: any) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        }));

      // ✅ Step 5: Aggregate Filters (Across all matching results, not just the current page)
      // For performance, we can do these in parallel or optimize further.

      // 5.1 Categories aggregation
      const categoryCounts = await prisma.$queryRaw<Array<{ id: string; name: string; count: bigint }>>(
        Prisma.sql`
          SELECT c.id, c.name, COUNT(p.id) as count
          FROM "products" p
          JOIN "categories" c ON p."categoryId" = c.id
          WHERE ${Prisma.raw(whereClause)}
          GROUP BY c.id, c.name
          ORDER BY count DESC
        `
      );

      // 5.2 Brands aggregation
      const brandCounts = await prisma.$queryRaw<Array<{ brand: string; count: bigint }>>(
        Prisma.sql`
          SELECT brand, COUNT(id) as count
          FROM "products" p
          WHERE ${Prisma.raw(whereClause)}
          GROUP BY brand
          ORDER BY count DESC
        `
      );

      // 5.3 Specifications aggregation (Getting unique keys and their common values)
      const topCategoryIds = categoryCounts.slice(0, 3).map((c: any) => c.id);

      const categorySpecs = await prisma.categorySpecification.findMany({
        where: { categoryId: { in: topCategoryIds } },
        select: { key: true, label: true }
      });

      const specKeys = categorySpecs.map((s: any) => s.key);

      const allMatchingProductIds = await prisma.$queryRaw<Array<{ id: string }>>(
        Prisma.sql`
          SELECT id::text FROM "products"
          WHERE ${Prisma.raw(whereClause)}
          LIMIT 100
        `
      );
      const sampleIds = allMatchingProductIds.map((p: any) => p.id);

      const specValues = await prisma.productSpecification.findMany({
        where: {
          key: { in: specKeys },
          variant: {
            product: { id: { in: sampleIds } }
          }
        },
        select: { key: true, value: true }
      });

      const specAgg: Record<string, Set<string>> = {};
      specValues.forEach((s: any) => {
        if (!specAgg[s.key]) specAgg[s.key] = new Set();
        specAgg[s.key].add(s.value);
      });

      const formattedSpecs: Record<string, { label: string; options: string[] }> = {};
      categorySpecs.forEach((cs: any) => {
        const values = specAgg[cs.key];
        if (values && values.size > 0) {
          formattedSpecs[cs.key] = {
            label: cs.label,
            options: Array.from(values).sort()
          };
        }
      });

      // 5.4 Delivery Options aggregation
      const deliveryCounts = await prisma.$queryRaw<Array<{ title: string; count: bigint }>>(
        Prisma.sql`
          SELECT del.title, COUNT(DISTINCT p.id) as count
          FROM "products" p
          JOIN "delivery_options" del ON p.id = del."productId"
          WHERE ${Prisma.raw(whereClause)}
          GROUP BY del.title
        `
      );

      return {
        products: orderedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        filters: {
          brands: brandCounts.map((b: any) => ({ name: b.brand, count: Number(b.count) })),
          categories: categoryCounts.map((c: any) => ({ id: c.id, name: c.name, count: Number(c.count) })),
          specifications: formattedSpecs,
          delivery: deliveryCounts.map((d: any) => ({ name: d.title, count: Number(d.count) })),
          // price, stock can be added similarly
        }
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

      // console.log("results-->",results)


      // Extract unique suggestions from product names, categories, and brands
      const suggestions = new Set<string>();
      results.forEach((result: any) => {
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
