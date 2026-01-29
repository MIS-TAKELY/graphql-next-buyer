
import { PrismaClient } from '../app/generated/prisma/index.js';
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        take: 5,
        select: { slug: true, status: true, name: true }
    });
    console.log('Local Products:', JSON.stringify(products, null, 2));

    const slug = 'motul-800-2t-factory-line-off-road-1-litre';
    const product = await prisma.product.findUnique({
        where: { slug },
        select: { id: true, status: true, name: true }
    });
    console.log('Motul Product Status:', JSON.stringify(product, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
