import { prisma } from "../lib/db/prisma";
import { generateEmbedding } from "./embemdind";
import { constructProductEmbeddingText } from "./productUtils";

async function indexAllProducts() {
  console.log("Starting product embedding indexing...");

  // Fetch products that need indexing (assumes declared as NULL via external update or new products)
  // Since 'embedding' is Unsupported, we can't filter by it in findMany directly.
  const unindexed = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM "products" WHERE embedding IS NULL LIMIT 1000
  `;

  if (unindexed.length === 0) {
    console.log("All products already indexed!");
    return;
  }

  // We use findMany to get relations efficiently for these IDs
  const products = await prisma.product.findMany({
    where: {
      id: { in: unindexed.map(p => p.id) },
    },
    include: {
      category: true,
      deliveryOptions: true,
      variants: {
        include: {
          specifications: true,
        },
      },
    },
  });

  if (products.length === 0) {
    console.log("All products already indexed!");
    return;
  }

  console.log(`Found ${products.length} products to index...`);

  let successCount = 0;
  let errorCount = 0;

  for (const product of products) {
    const text = constructProductEmbeddingText(product);

    if (!text) {
      console.warn(`⚠️ Skipped ${product.id} (empty text)`);
      continue;
    }

    try {
      // Use 'passage' type for product documents (not queries)
      const vector = await generateEmbedding(text, 'passage');

      if (vector.length !== 384) {
        console.warn(`⚠️ Unexpected embedding dimension: ${vector.length} (expected 384)`);
      }

      const vectorString = `[${vector.join(",")}]`;

      await prisma.$executeRawUnsafe(`
        UPDATE "products"
        SET embedding = '${vectorString}'::vector
        WHERE id = '${product.id}'
      `);

      successCount++;
      console.log(`✅ Indexed: ${product.name} (${product.id})`);
    } catch (error: any) {
      errorCount++;
      console.error(`❌ Failed for ${product.name} (${product.id}):`, error.message || error);
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
