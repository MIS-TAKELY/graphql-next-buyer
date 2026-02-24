import 'dotenv/config';
import { prisma } from '../lib/db/prisma.js';

async function main() {
    try {
        const categories = await prisma.category.findMany({
            where: {
                OR: [
                    { name: { contains: 'Camera', mode: 'insensitive' } },
                    { name: { contains: 'Digital', mode: 'insensitive' } },
                ]
            },
            select: {
                id: true,
                name: true,
                parentId: true
            }
        });
        console.log("--- Camera Related Categories ---");
        console.log(JSON.stringify(categories, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
