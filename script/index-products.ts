// scripts/index-products.ts
import { generateEmbedding } from "@/lib/index-embedding";
import { prisma } from "../lib/db/prisma";

async function indexAllProducts() {
  const products = await prisma.$queryRaw`
    SELECT id, name, description, brand
    FROM "products"
    WHERE embedding IS NULL
    LIMIT 1000
  `;

  for (const p of products as any) {
    const text = `${p.name} ${p.description ?? ""} ${p.brand}`.trim();
    if (!text) continue;
    const vector = await generateEmbedding(text);
    if (!vector) {
      console.warn(
        "Embedding generator not available in this environment — stopping indexing."
      );
      return;
    }
    await prisma.$executeRaw`
      UPDATE "products"
      SET embedding = ${vector}::vector
      WHERE id = ${p.id}
    `;
    console.log("Indexed", p.id);
  }
  await prisma.$disconnect();
}

indexAllProducts().catch((err) => {
  console.error(err);
  process.exit(1);
});
