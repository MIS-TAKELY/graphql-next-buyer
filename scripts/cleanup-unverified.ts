import { prisma } from "../lib/db/prisma";

/**
 * Cleanup script to remove old verification records and potentially unverified users
 * who haven't completed signup after 24 hours.
 */
async function cleanup() {
    console.log("Starting cleanup of unverified records...");

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 1. Delete verification records that have expired or are older than 24 hours
    const deletedVerifications = await prisma.verification.deleteMany({
        where: {
            OR: [
                { expiresAt: { lt: new Date() } },
                { createdAt: { lt: oneDayAgo } }
            ]
        }
    });
    console.log(`Deleted ${deletedVerifications.count} old/expired verification records.`);

    // 2. Delete users who have a temporary email and were created more than 24 hours ago
    // (This handles legacy users created before the new flow)
    const deletedTempUsers = await prisma.user.deleteMany({
        where: {
            email: { contains: "@vanijay.temp" },
            createdAt: { lt: oneDayAgo },
            emailVerified: false
        }
    });
    console.log(`Deleted ${deletedTempUsers.count} unverified temporary user accounts.`);

    console.log("Cleanup completed.");
}

cleanup()
    .catch(err => {
        console.error("Cleanup failed:", err);
        process.exit(1);
    })
    .finally(() => {
        process.exit(0);
    });
