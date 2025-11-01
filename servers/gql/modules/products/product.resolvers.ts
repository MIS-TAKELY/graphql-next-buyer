import { prisma } from "@/lib/db/prisma";
import { getCache, setCache } from "@/services/redis.services";
// const { pipeline } = require("@xenova/transformers");

// let embedder: any;

// async function getEmbedder() {
//   if (!embedder) {
//     const { pipeline } = await import("@xenova/transformers");
//     embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
//   }
//   return embedder;
// }

// async function findHighlyMatchedProducts(searchTerm: string, limit = 50) {
//   const embedder = await getEmbedder();
//   const queryEmbedding = await embedder(searchTerm, {
//     pooling: "mean",
//     normalize: true,
//   });
//   const queryVec = Array.from(queryEmbedding.data); // Flatten to array

//   // Vector search (assumes pgvector extension: CREATE EXTENSION vector;)
//   let vectorMatches = await prisma.$queryRaw`
//     SELECT id, name, 1 - (embedding <=> ${queryVec}::vector) AS similarity
//     FROM "products"
//     WHERE embedding IS NOT NULL  -- NEW: Skip null embeddings
//     ORDER BY embedding <=> ${queryVec}::vector
//     LIMIT ${limit}
//   `;

//   if (vectorMatches.length < limit / 2) {
//     // Fallback to full-text search if few vector hits
//     const fallbackMatches = await prisma.$queryRaw`
//       SELECT id, name, 0 AS similarity
//       FROM "products"
//       WHERE to_tsvector('english', name || ' ' || COALESCE(brand, '') || ' ' || COALESCE(description, '')) @@ plainto_tsquery('english', ${searchTerm})
//       LIMIT ${limit}
//     `;
//     vectorMatches = vectorMatches.concat(fallbackMatches);
//     vectorMatches.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
//   }

//   // Enrich with full product details (select only needed fields for efficiency)
//   const enriched = await Promise.all(
//     vectorMatches.slice(0, limit).map(async (p) => {
//       const fullProduct = await prisma.product.findUnique({
//         where: { id: p.id },
//         select: {
//           id: true,
//           name: true,
//           brand: true,
//           // Add other fields as needed (e.g., description, categoryId)
//         },
//       });
//       return { ...fullProduct, similarity: p.similarity };
//     })
//   );

//   // Filter out nulls (in case of DB issues)
//   return enriched.filter(Boolean);
// }

// async function findRelatedProducts(
//   highlyMatched: any[],
//   searchTerm: string,
//   limit = 5
// ) {
//   if (highlyMatched.length === 0) return [];

//   // Prompt LLM for smart suggestions
//   const prompt = `Based on search "${searchTerm}" and these top products: ${JSON.stringify(
//     highlyMatched.slice(0, 3).map((p) => ({
//       id: p.id,
//       name: p.name,
//       brand: p.brand,
//       description: p.description,
//     }))
//   )},
//   suggest ${limit} related product IDs from the same category, prioritizing different brands and similar specs/price. Output JSON: {relatedIds: [IDs]} `;

//   console.log("prompt-->", prompt);

//   // Call xAI API (replace with your key; see https://x.ai/api)
//   const response = await fetch("https://api.x.ai/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${process.env.XAI_API_KEY || "YOUR_XAI_API_KEY"}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       model: "grok-beta", // Or latest
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 100,
//     }),
//   });

//   console.log("response--->", response);

//   if (!response.ok) {
//     console.error("xAI API error:", await response.text());
//     return []; // Graceful fallback
//   }

//   const { choices } = await response.json();
//   let suggestedIds;
//   try {
//     suggestedIds = JSON.parse(choices[0].message.content).relatedIds;
//   } catch (e) {
//     console.error("JSON parse error in xAI response:", e);
//     return []; // Fallback if invalid JSON
//   }

//   // Fetch those
//   return prisma.product.findMany({
//     where: { id: { in: suggestedIds } },
//     include: {
//       variants: {
//         include: {
//           specifications: true,
//         },
//       },
//     },
//   });
// }

export const productResolvers = {
  Query: {
    // searchProducts: async (_: any, { query }: { query: string }) => {
    //   // Use semantic search or your preferred method
    //   return await productSearch.searchProducts(query);
    // },
    getProductBySlug: async (_: any, { slug }: { slug: string }) => {
      if (!slug) throw new Error("Slug is required");

      const productKey = `product:${slug}`;
      const cached = await getCache(productKey);

      if (cached) {
        console.log(`⚡ Returning product ${slug} from Redis`);
        return cached;
      }

      console.log("returning from database");

      const start = Date.now();
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          seller: { select: { id: true, firstName: true, lastName: true } },
          variants: {
            select: {
              id: true,
              price: true,
              stock: true,
              isDefault: true,
              mrp: true,
              attributes: true,
              specifications: true,
            },
          },
          deliveryOptions: true,
          images: true,
          reviews: {
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
              user: { select: { firstName: true, lastName: true } },
              media: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              parent: { select: { id: true, name: true } },
            },
          },
          productOffers: {
            include: {
              offer: true,
            },
          },
        },
      });
      console.log(`getProductBySlug query took ${Date.now() - start}ms`);

      if (product) {
        await setCache(productKey, product, 86400); // Cache for 1 day
      }

      return product;
    },
  },
};
