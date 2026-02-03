
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Starting VPS indexing...");

    // Fetch unindexed
    const products = await prisma.$queryRawUnsafe(`
    SELECT id, name, description, brand 
    FROM "products" 
    WHERE embedding IS NULL
    LIMIT 200
  `);

    console.log(`Found ${products.length} products to index.`);
    if (products.length === 0) return;

    for (const product of products) {
        const text = `${product.name} ${product.description || ""} ${product.brand}`.trim();
        if (!text) continue;

        try {
            const response = await fetch(process.env.EMBEDDING_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ texts: [text] }),
            });

            if (!response.ok) throw new Error(response.statusText);

            const data = await response.json();
            const vector = data.embeddings[0];

            if (vector.length !== 384) {
                console.warn(`Dimension mismatch: ${vector.length}`);
                continue;
            }

            const vectorString = `[${vector.join(",")}]`;

            await prisma.$executeRawUnsafe(`
        UPDATE "products"
        SET embedding = '${vectorString}'::vector
        WHERE id = '${product.id}'
      `);
            console.log(`Indexed: ${product.name}`);
        } catch (e) {
            console.error(`Failed ${product.id}:`, e.message);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
