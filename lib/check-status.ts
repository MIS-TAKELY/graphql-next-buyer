
import { prisma } from "./db/prisma";

async function main() {
    console.log("Checking indexing status...");

    const totalProducts = await prisma.product.count();

    // Use raw query for counting because 'embedding' field is unsupported in client
    const indexedResult = await prisma.$queryRawUnsafe<any[]>(`
    SELECT COUNT(*)::int as count FROM "products" WHERE embedding IS NOT NULL
  `);

    const indexedProducts = Number(indexedResult[0].count);
    const unindexedProducts = totalProducts - indexedProducts;

    console.log(`Total Products: ${totalProducts}`);
    console.log(`Indexed Products: ${indexedProducts}`);
    console.log(`Unindexed Products: ${unindexedProducts}`);

    if (unindexedProducts > 0) {
        console.log("⚠️ Some products are not indexed.");
    } else {
        console.log("✅ All products are indexed.");
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
