
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const verifications = await prisma.verification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    console.log('--- Verification Records ---');
    console.log(verifications);
}

check()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
