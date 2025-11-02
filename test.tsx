// import { Prisma, prisma } from "@/lib/db/prisma";
// import { GraphQLError } from "graphql";
// import { parseQuery } from "./parseQuery"; // Assuming parseQuery is in a separate file
// import { generateEmbedding } from "./embedding"; // Assuming this is where generateEmbedding is defined

// export const searchProducts = async (_: any, { query }: { query: string }) => {
//   try {
//     const { text, filters } = await parseQuery(query);
//     let vectorParam: string | null = null;
//     let params: any[] = [];

//     // Only generate embedding if text is non-empty
//     if (text.trim()) {
//       const vector = await generateEmbedding(text);
//       if (!vector || !Array.isArray(vector) || vector.length !== 384) {
//         throw new Error("Invalid embedding generated");
//       }
//       vectorParam = JSON.stringify(vector);
//       params.push(vectorParam); // $1 is the vector
//     }

//     let where = Prisma.sql`TRUE`; // Start with TRUE to avoid unnecessary embedding filter
//     let join = Prisma.sql``;

//     // Apply filters (price, color, size, gender)
//     if (filters.price?.lte != null) {
//       where = Prisma.sql`${where} AND pv.price <= ${filters.price.lte}`;
//     }
//     if (filters.price?.gte != null) {
//       where = Prisma.sql`${where} AND pv.price >= ${filters.price.gte}`;
//     }
//     if (filters.color?.length) {
//       join = Prisma.sql`${join} LEFT JOIN "product_specifications" ps_color ON pv.id = ps_color."variantId" AND ps_color.key = 'color'`;
//       where = Prisma.sql`${where} AND LOWER(ps_color.value) IN (${Prisma.join(
//         filters.color.map((c: string) => c.toLowerCase())
//       )})`;
//       params.push(...filters.color); // Add colors for subsequent placeholders
//     }
//     if (filters.size) {
//       join = Prisma.sql`${join} LEFT JOIN "product_specifications" ps_size ON pv.id = ps_size."variantId" AND ps_size.key = 'size'`;
//       where = Prisma.sql`${where} AND UPPER(ps_size.value) = ${filters.size}`;
//       params.push(filters.size); // Add size for placeholder
//     }
//     if (filters.gender) {
//       join = Prisma.sql`${join} LEFT JOIN "categories" c ON p."categoryId" = c.id`;
//       where = Prisma.sql`${where} AND (p.description ILIKE ${"%" + filters.gender + "%"} OR c.name ILIKE ${"%" + filters.gender + "%"})`;
//       params.push(filters.gender); // Add gender for placeholder
//     }

//     // Build the SELECT clause
//     const selectClause = Prisma.sql`
//       SELECT
//         p.id, p.name, p.description, p.brand,
//         c.id AS "categoryId", c.name AS "categoryName", c.slug AS "categorySlug",
//         pv.price, pv.mrp, ((pv.mrp - pv.price) / pv.mrp * 100) AS discount,
//         p."sellerId",
//         COALESCE(u."firstName" || ' ' || u."lastName", u."firstName", 'Unknown Seller') AS "sellerName",
//         COALESCE(r.rating, 0) AS rating,
//         COALESCE(r.review_count, 0) AS "reviewCount",
//         pv.stock,
//         p."createdAt", p."updatedAt",
//         ${vectorParam ? Prisma.sql`1 - (p.embedding <=> ${vectorParam}::vector) AS similarity` : Prisma.sql`0 AS similarity`}
//       FROM "products" p
//       JOIN "product_variants" pv ON p.id = pv."productId"
//       LEFT JOIN "categories" c ON p."categoryId" = c.id
//       LEFT JOIN "users" u ON p."sellerId" = u.id AND u.role = 'SELLER'
//       LEFT JOIN (
//           SELECT "productId", AVG(rating) AS rating, COUNT(*) AS review_count
//           FROM reviews
//           GROUP BY "productId"
//       ) r ON p.id = r."productId"
//       ${join}
//       WHERE ${where}
//       ${vectorParam ? Prisma.sql`ORDER BY similarity DESC` : Prisma.sql`ORDER BY p."createdAt" DESC`}
//       LIMIT 10;
//     `;

//     // Execute the query
//     const rows = await prisma.$queryRaw<
//       Array<{
//         id: string;
//         name: string;
//         description: string | null;
//         brand: string;
//         categoryId: string;
//         categoryName: string;
//         categorySlug: string;
//         price: number;
//         mrp: number;
//         discount: number;
//         sellerId: string;
//         sellerName: string;
//         rating: number;
//         reviewCount: number;
//         stock: number;
//         createdAt: Date;
//         updatedAt: Date;
//         similarity: number;
//       }>
//     >(selectClause, ...params);

//     // Fetch specifications and images
//     const productIds = rows.map((row) => row.id);
//     const specifications = await prisma.productSpecification.findMany({
//       where: { variantId: { in: productIds } },
//       select: { variantId: true, key: true, value: true },
//     });
//     const images = await prisma.productImage.findMany({
//       where: { productId: { in: productIds } },
//       select: { productId: true, url: true, altText: true },
//     });

//     // Map rows to SearchProduct objects
//     const products = rows.map((row) => ({
//       id: row.id,
//       name: row.name,
//       description: row.description,
//       brand: row.brand,
//       category: row.categoryId
//         ? {
//             id: row.categoryId,
//             name: row.categoryName,
//             slug: row.categorySlug,
//           }
//         : null,
//       price: row.price,
//       mrp: row.mrp,
//       discount: row.discount,
//       sellerId: row.sellerId,
//       sellerName: row.sellerName || "Unknown Seller",
//       rating: row.rating,
//       reviewCount: row.reviewCount,
//       stock: row.stock,
//       images: images
//         .filter((img) => img.productId === row.id)
//         .map((img) => ({
//           url: img.url,
//           altText: img.altText || "",
//         })),
//       specifications: specifications
//         .filter((spec) => spec.variantId === row.id)
//         .map((spec) => ({ key: spec.key, value: spec.value })),
//       score: row.similarity,
//       createdAt: row.createdAt.toISOString(),
//       updatedAt: row.updatedAt.toISOString(),
//     }));

//     // Calculate total count using raw SQL to avoid embedding filter issue
//     const totalResult = await prisma.$queryRaw<{ count: bigint }[]>`
//       SELECT COUNT(DISTINCT p.id) AS count
//       FROM "products" p
//       JOIN "product_variants" pv ON p.id = pv."productId"
//       ${join}
//       WHERE ${where}
//     `;
//     const total = Number(totalResult[0]?.count || 0);

//     const pagination = {
//       page: 1,
//       limit: 10,
//       total,
//       totalPages: Math.ceil(total / 10),
//     };

//     // Calculate facets (placeholder; replace with actual logic)
//     const facets = {
//       categories: [
//         { key: "electronics", doc_count: 50 },
//         { key: "laptops", doc_count: 20 },
//       ],
//       brands: [
//         { key: "dell", doc_count: 10 },
//         { key: "hp", doc_count: 8 },
//       ],
//       priceRanges: [
//         { key: "0-500", from: 0, to: 500, doc_count: 15 },
//         { key: "500-1000", from: 500, to: 1000, doc_count: 10 },
//       ],
//       priceStats: { avg: 750, min: 200, max: 2000 },
//     };

//     return {
//       products: products.length ? products : [],
//       pagination,
//       facets,
//       name: query,
//     };
//   } catch (error) {
//     console.error("Error in searchProducts resolver:", error);
//     throw new GraphQLError("Failed to search products", {
//       extensions: {
//         code: "INTERNAL_SERVER_ERROR",
//         originalError: error,
//       },
//     });
//   }
// };