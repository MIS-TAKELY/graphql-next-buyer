import 'dotenv/config';
import { prisma } from '../lib/db/prisma.js';

async function main() {
    try {
        const categories = await prisma.category.findMany({
            where: {
                OR: [
                    { name: { contains: 'Smartphones', mode: 'insensitive' } },
                    { name: { contains: 'Smart phones', mode: 'insensitive' } },
                ]
            },
            select: {
                id: true,
                name: true,
                _count: {
                    select: { products: true }
                }
            }
        });
        console.log("--- Smartphone Categories Comparison ---");
        console.log(JSON.stringify(categories, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
