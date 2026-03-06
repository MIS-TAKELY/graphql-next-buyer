import { PrismaClient } from './app/generated/prisma/index';

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
            slug: true,
        },
    });
    console.log(JSON.stringify(products, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
