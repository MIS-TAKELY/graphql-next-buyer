import 'dotenv/config';
import { prisma } from '../lib/db/prisma.js';

async function main() {
    // ID from Typesense which usually matches Prisma ID
    const productId = "cmlxdra3000ff01p3hn1g2vdg";
    const targetCategoryId = "cmkxnm01u004r01pb5190b3bo"; // Mirrorless Cameras

    try {
        console.log(`Attempting to update product by ID: ${productId}`);

        const updatedById = await prisma.product.updateMany({
            where: { id: productId },
            data: { categoryId: targetCategoryId }
        });

        console.log(`Updated by ID: ${updatedById.count} products.`);

        if (updatedById.count === 0) {
            console.log("Attempting update by name (case-insensitive)...");
            const updatedByName = await prisma.product.updateMany({
                where: { name: { contains: "Sony ZV-1 II", mode: 'insensitive' } },
                data: { categoryId: targetCategoryId }
            });
            console.log(`Updated by name: ${updatedByName.count} products.`);
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
