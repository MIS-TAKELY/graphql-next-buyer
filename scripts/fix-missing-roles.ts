
import { prisma } from "../lib/db/prisma.js";

async function main() {
    console.log("🚀 Starting BUYER role check for all users...");

    const users = await prisma.user.findMany({
        include: {
            roles: true
        }
    });

    console.log(`Found ${users.length} total users.`);
    let fixedCount = 0;

    for (const user of users) {
        const hasBuyerRole = user.roles.some(r => r.role === "BUYER");

        if (!hasBuyerRole) {
            console.log(`Fixing missing BUYER role for user: ${user.email} (${user.id})`);
            await prisma.userRole.create({
                data: {
                    userId: user.id,
                    role: "BUYER"
                }
            });
            fixedCount++;
        }
    }

    console.log(`✅ Done! Fixed ${fixedCount} users.`);
}

main()
    .catch((e) => {
        console.error("❌ Error during cleanup:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
