
import { prisma } from "./db/prisma";
import { generateEmbedding } from "./embemdind";

process.env.EMBEDDING_API_URL = "http://72.61.249.56:8000/embed";

async function main() {
    console.log("Fetching unindexed product...");
    // Use unsafe raw query because 'embedding' field is not supported in Prisma Client types
    const products = await prisma.$queryRawUnsafe<any[]>(`
    SELECT id, name, description, brand 
    FROM "products" 
    WHERE embedding IS NULL 
    LIMIT 1
  `);

    if (!products || products.length === 0) {
        console.log("No unindexed products found.");
        return;
    }

    const product = products[0];
    console.log(`Attempting to index: ${product.name} (${product.id})`);
    const text = `${product.name} ${product.description || ""} ${product.brand}`.trim();

    try {
        const vector = await generateEmbedding(text);
        console.log(`Generated vector size: ${vector.length}`);
        const vectorString = `[${vector.join(",")}]`;

        await prisma.$executeRawUnsafe(`
      UPDATE "products"
      SET embedding = '${vectorString}'::vector
      WHERE id = '${product.id}'
    `);
        console.log("✅ Success!");
    } catch (e: any) {
        console.error("❌ Failed!");
        console.error(e);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
