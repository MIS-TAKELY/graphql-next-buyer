import 'dotenv/config';
import { prisma } from '../lib/db/prisma.js';

async function main() {
    const productName = "Sony ZV-1 II (ZV-1M2) Vlog Camera Price in Nepal | 4K 30p & FHD 120p";
    // Target category: Mirrorless Cameras (from my search result)
    const targetCategoryId = "cmkxnm01u004r01pb5190b3bo";

    try {
        console.log(`Reassigning "${productName}" to category ID: ${targetCategoryId}`);

        const updated = await prisma.product.updateMany({
            where: { name: { contains: "Sony ZV-1 II" } },
            data: { categoryId: targetCategoryId }
        });

        console.log(`Updated ${updated.count} products.`);

        // Also check if there are any other products in the wrong "Smart phones" category
        // The wrong one was cmlxdqjpx00fa01p3at693ivt
        const wrongCatId = "cmlxdqjpx00fa01p3at693ivt";
        const otherWrongProducts = await prisma.product.findMany({
            where: { categoryId: wrongCatId },
            select: { name: true, id: true }
        });

        console.log(`Other products in the wrong "Smart phones" category (${wrongCatId}):`, otherWrongProducts.length);
        otherWrongProducts.forEach(p => console.log(`- ${p.name}`));

    } catch (e) {
        console.error("Error:", e);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
