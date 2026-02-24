import 'dotenv/config';
import { prisma } from '../lib/db/prisma.js';

async function main() {
    try {
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
                parentId: true
            }
        });
        console.log("--- All Categories ---");
        console.log(JSON.stringify(categories, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
