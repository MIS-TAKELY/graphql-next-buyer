import { prisma } from "../lib/db/prisma";

async function main() {
    try {
        const categories = await prisma.category.findMany({
            select: { name: true, slug: true, id: true }
        });
        console.log("Categories in Database:");
        console.log(JSON.stringify(categories, null, 2));
    } catch (error) {
        console.error("Error fetching categories:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
