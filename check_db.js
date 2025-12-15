
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const products = await prisma.product.findMany({
            where: { status: 'ACTIVE' },
            select: { slug: true, name: true, status: true }
        });
        console.log('Active products count:', products.length);
        console.log('Sample:', products.slice(0, 3));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
