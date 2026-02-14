
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const phone = '9815328936';
    const user = await prisma.user.findFirst({
        where: {
            phoneNumber: phone
        },
        select: {
            id: true,
            email: true,
            phoneNumber: true
        }
    });

    console.log('--- DB CHECK RESULT ---');
    if (user) {
        console.log('User found:', user);
    } else {
        console.log('User NOT found for phone:', phone);
    }

    // Also print the DATABASE_URL (redacted)
    const url = process.env.DATABASE_URL || 'undefined';
    console.log('DATABASE_URL:', url.replace(/:[^:]*@/, ':***@'));
}

check()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
