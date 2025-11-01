import { pipeline } from '@xenova/transformers';
import { prisma } from './db/prisma';

// Initialize the model
let extractor: any;
async function initExtractor() {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
}

async function generateEmbedding(text: string): Promise<number[]> {
  const extractor = await initExtractor();
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data) as number[];
}

async function indexAllProducts() {
  console.log('Starting product embedding indexing...');

  // Step 1: Get products with NULL embedding using raw query
  const products: Array<{ id: string; name: string; description: string | null; brand: string }> =
    await prisma.$queryRaw`
      SELECT id, name, description, brand
      FROM "products"
      WHERE embedding IS NULL
      LIMIT 1000
    `;

  if (products.length === 0) {
    console.log('All products already indexed!');
    return;
  }

  console.log(`Found ${products.length} products to index...`);

  let successCount = 0;
  let errorCount = 0;

  for (const product of products) {
    const text = `${product.name} ${product.description || ''} ${product.brand}`.trim();
    if (!text) {
      console.warn(`Skipping empty text for product: ${product.id}`);
      continue;
    }

    try {
      const vector = await generateEmbedding(text);

      // Step 2: Update using raw query
      await prisma.$executeRaw`
        UPDATE "products"
        SET embedding = ${vector}::vector
        WHERE id = ${product.id}
      `;

      successCount++;
      console.log(`Indexed: ${product.id} - "${product.name}"`);
    } catch (error) {
      errorCount++;
      console.error(`Failed for ${product.id}:`, error);
    }
  }

  console.log(`\nDone! Indexed: ${successCount}, Failed: ${errorCount}`);
}

indexAllProducts()
  .catch((e) => {
    console.error('Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });