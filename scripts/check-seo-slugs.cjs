const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSeoSlugs() {
    const seoPages = await prisma.seoPage.findMany({
        select: { urlPath: true },
        take: 50
    });
    console.log(JSON.stringify(seoPages, null, 2));
    await prisma.$disconnect();
}

checkSeoSlugs();
