const { PrismaClient } = require('@prisma/client');

// Need to point to the right schema/client if generated in a custom path
// But buyer has its own prisma in app/generated/prisma
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        where: {
            name: {
                contains: 'Dell 27 Plus',
                mode: 'insensitive',
            },
        },
        select: {
            id: true,
            name: true,
            status: true,
        },
    });
    console.log(JSON.stringify(products, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
