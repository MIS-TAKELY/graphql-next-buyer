import { prisma } from "@/lib/db/prisma";

let embedder: any;

/**
 * Initialize Xenova embedding pipeline
 */
async function getEmbedder() {
  if (!embedder) {
    const { pipeline } = await import("@xenova/transformers");
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedder;
}

/**
 * Generate a concise summary string from product specs
 */
function generateSpecsSummary(variants: any[]): string {
  if (!variants || variants.length === 0) return "";

  const specMap = new Map<string, string[]>();
  variants.forEach((variant) => {
    if (variant.specifications) {
      variant.specifications.forEach((spec: any) => {
        if (!specMap.has(spec.key)) specMap.set(spec.key, []);
        specMap.get(spec.key)!.push(spec.value);
      });
    }
  });

  return Array.from(specMap.entries())
    .map(([key, values]) => `${key}: ${[...new Set(values)].join(", ")}`)
    .join(" | ");
}

/**
 * Generate embedding vector from text
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const embedder = await getEmbedder();
  const embedding = await embedder(text, { pooling: "mean", normalize: true });
  return Array.from(embedding.data); // Ensure it’s an array of numbers
}

/**
 * Check if an embedding needs updating (null, empty, or wrong dimension)
 */
function needsEmbedding(embedding: any, expectedDim = 384): boolean {
  if (embedding === null) return true;
  if (!Array.isArray(embedding)) return true;
  if (embedding.length === 0) return true;
  if (embedding.length !== expectedDim) return true;
  return false;
}

/**
 * Seed embeddings for products missing or incomplete embeddings
 */
async function seedEmbeddings(options: { batchSize?: number; overwriteIncomplete?: boolean } = {}) {
  const { batchSize = 1000, overwriteIncomplete = true } = options;

  console.log("Fetching products from database...");
  const products = await prisma.product.findMany({
    take: batchSize,
    include: {
      category: { select: { name: true } },
      variants: { include: { specifications: true } },
    },
  });

  // Debug: Log sample embeddings to inspect types/values
  console.log("Sample product embeddings (first 3):");
  products.slice(0, 3).forEach((p, i) => {
    console.log(`  Product ${i + 1} (ID: ${p.id}): embedding =`, p.embedding, `| type: ${typeof p.embedding} | length: ${Array.isArray(p.embedding) ? p.embedding.length : 'N/A'}`);
  });

  const unembeddedProducts = products.filter((p) =>
    needsEmbedding(p.embedding, 384) || !overwriteIncomplete
  );
  console.log(`Found ${unembeddedProducts.length} products needing embeddings.`);

  if (unembeddedProducts.length === 0) {
    console.log("No products need embeddings. Exiting.");
    await prisma.$disconnect();
    return;
  }

  // Process in smaller batches for better progress tracking
  const batchSizeSmall = 50;
  for (let i = 0; i < unembeddedProducts.length; i += batchSizeSmall) {
    const batch = unembeddedProducts.slice(i, i + batchSizeSmall);
    console.log(`Processing batch ${Math.floor(i / batchSizeSmall) + 1} (${batch.length} products)...`);

    await Promise.all(
      batch.map(async (product) => {
        const categoryName = product.category?.name || "";
        const description = product.description || "";
        const specsSummary = generateSpecsSummary(product.variants);

        const text = [product.name, product.brand, categoryName, description, specsSummary]
          .filter(Boolean)
          .join(" ")
          .trim();

        if (!text) {
          console.warn(`⚠️ Skipping ${product.name} (${product.id}): No text to embed.`);
          return;
        }

        try {
          const embedding = await generateEmbedding(text);
          await prisma.product.update({
            where: { id: product.id },
            data: { embedding: embedding as any }, // Prisma + pgvector compatible
          });
          console.log(`✅ Embedded: ${product.name} (${product.id})`);
        } catch (err) {
          console.error(`❌ Failed to embed ${product.name} (${product.id}):`, err);
        }
      })
    );
  }

  console.log("All embeddings seeded.");
  await prisma.$disconnect();
}

// Run the seeding
// seedEmbeddings()
//   .then(() => console.log("Seeding complete."))
//   .catch((err) => {
//     console.error("Seeding failed:", err);
//     prisma.$disconnect().catch(() => {}); // Graceful disconnect on error
//     process.exit(1);
//   });

async function verifyEmbeddings() {
  const count = await prisma.product.count({ where: { embedding: { not: null } } });
  console.log(`✅ ${count}/${await prisma.product.count()} products have valid embeddings.`);
}

// In main:
await seedEmbeddings({ batchSize: 1000, overwriteIncomplete: false });
await verifyEmbeddings();