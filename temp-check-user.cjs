
const { PrismaClient } = require('./app/generated/prisma');
const prisma = new PrismaClient();

async function check() {
    const email = 'addressofbhivasharma@gmail.com';
    const phone = '9801993834';
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: email },
                { phoneNumber: phone }
            ]
        },
    });

    if (user) {
        console.log('USER_FOUND');
        console.log(JSON.stringify(user));
    } else {
        console.log('USER_NOT_FOUND');
    }
}

check()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
