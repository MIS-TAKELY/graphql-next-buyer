
const { PrismaClient } = require('./app/generated/prisma');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
            id: true,
            name: true,
            slug: true,
            specificationTable: true,
            updatedAt: true
        }
    });

    console.log(JSON.stringify(products, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
