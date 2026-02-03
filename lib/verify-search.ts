
import { prisma } from "./db/prisma";
import { generateEmbedding } from "./embemdind";

// Explicitly use the VPS URL for verification to be sure
process.env.EMBEDDING_API_URL = "http://72.61.249.56:8000/embed";

async function search(query: string) {
  console.log(`Searching for: "${query}"`);
  const vector = await generateEmbedding(query);
  console.log(`Generated vector of length: ${vector.length}`);

  const vectorString = `[${vector.join(",")}]`;
  console.log(`Vector string length: ${vectorString.length}`);

  const products = await prisma.$queryRawUnsafe(`
    SELECT id, name, 1 - (embedding <=> '${vectorString}'::vector) as similarity
    FROM "products"
    WHERE embedding IS NOT NULL
    ORDER BY similarity DESC
    LIMIT 5
  `);

  console.log("Results:", products);
}

search("laptop")
  .catch(console.error)
  .finally(() => prisma.$disconnect());
