import { prisma } from "../lib/db/prisma";

async function checkEmbeddings() {
    console.log("📊 Checking embedding coverage...\n");

    const total = await prisma.product.count({
        where: { status: "ACTIVE" },
    });

    const withEmbeddings = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as count
    FROM "products"
    WHERE embedding IS NOT NULL AND status = 'ACTIVE'
  `;

    const count = Number(withEmbeddings[0]?.count || 0);
    const percentage = total > 0 ? ((count / total) * 100).toFixed(2) : "0";

    console.log(`📊 Embedding Status:`);
    console.log(`  Total active products: ${total}`);
    console.log(`  Products with embeddings: ${count}`);
    console.log(`  Coverage: ${percentage}%`);

    if (count < total) {
        console.log(`\n⚠️  ${total - count} products need embeddings`);
        console.log(`\n💡 To generate embeddings, run:`);
        console.log(`   npx tsx lib/index-embedding.ts`);
    } else {
        console.log(`\n✅ All active products have embeddings!`);
    }

    // Show sample products without embeddings
    if (count < total) {
        console.log(`\n📋 Sample products without embeddings:`);
        const samplesWithoutEmbeddings = await prisma.$queryRaw<
            Array<{ id: string; name: string; brand: string }>
        >`
            SELECT id::text, name, brand
            FROM "products"
            WHERE status = 'ACTIVE' AND embedding IS NULL
            LIMIT 5
        `;

        samplesWithoutEmbeddings.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.name} (${p.brand}) - ID: ${p.id}`);
        });

        if (total - count > 5) {
            console.log(`   ... and ${total - count - 5} more`);
        }
    }
}

checkEmbeddings()
    .catch((error) => {
        console.error("❌ Error checking embeddings:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
