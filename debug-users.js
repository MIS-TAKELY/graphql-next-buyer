
import { PrismaClient } from "./app/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        take: 5,
        select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
        }
    });

    console.log("Sample Users:");
    console.log(JSON.stringify(users, null, 2));

    const stats = await prisma.user.aggregate({
        _count: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
        }
    });

    console.log("\nPopulation Stats:");
    console.log(JSON.stringify(stats, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
