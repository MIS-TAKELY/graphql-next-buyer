// scripts/index-embeddings.ts
import { ProductForEmbedding } from "@/script/index-products";
import { prisma } from "../lib/db/prisma";
import { generateEmbedding } from "./embemdind";

async function indexAllProducts() {
  console.log("Starting product embedding indexing...");

  const products = await prisma.$queryRaw<ProductForEmbedding[]>`
  SELECT id, name, description, brand
  FROM "products"
  WHERE embedding IS NULL
  LIMIT 1000
`;

  if (products.length === 0) {
    console.log("All products already indexed!");
    return;
  }

  console.log(`Found ${products.length} products to index...`);

  let successCount = 0;
  let errorCount = 0;

  for (const product of products) {
    const text = `${product.name} ${product.description || ""} ${
      product.brand
    }`.trim();
    if (!text) continue;

    try {
      const vector = await generateEmbedding(text);

      await prisma.$executeRaw`
        UPDATE "products"
        SET embedding = ${vector}::vector
        WHERE id = ${product.id}
      `;

      successCount++;
      console.log(`Indexed: ${product.id}`);
    } catch (error: any) {
      errorCount++;
      console.error(`Failed for ${product.id}:`, error.message || error);
    }
  }

  console.log(`\nDone! Indexed: ${successCount}, Failed: ${errorCount}`);
}

indexAllProducts()
  .catch((e) => {
    console.error("Script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
