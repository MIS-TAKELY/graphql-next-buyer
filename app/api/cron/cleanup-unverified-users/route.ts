import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        // Verify cron secret for security
        const authHeader = req.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret) {
            console.error('CRON_SECRET not configured');
            return NextResponse.json(
                { error: "Cron job not configured" },
                { status: 500 }
            );
        }

        if (authHeader !== `Bearer ${cronSecret}`) {
            console.error('Unauthorized cron job attempt');
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Calculate the cutoff time (1 hour ago)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        // Find users with unverified emails created more than 1 hour ago
        const unverifiedUsers = await prisma.user.findMany({
            where: {
                emailVerified: false,
                createdAt: {
                    lt: oneHourAgo
                }
            },
            select: {
                id: true,
                email: true,
                createdAt: true
            }
        });

        if (unverifiedUsers.length === 0) {
            console.log('No unverified users to clean up');
            return NextResponse.json({
                success: true,
                message: "No unverified users found",
                deletedCount: 0
            });
        }

        // Delete unverified users (cascading deletes will handle related data)
        const deleteResult = await prisma.user.deleteMany({
            where: {
                id: {
                    in: unverifiedUsers.map(u => u.id)
                }
            }
        });

        // Log the cleanup operation
        console.log(`Cleaned up ${deleteResult.count} unverified users:`, {
            deletedCount: deleteResult.count,
            users: unverifiedUsers.map(u => ({
                email: u.email,
                createdAt: u.createdAt
            }))
        });

        return NextResponse.json({
            success: true,
            message: `Successfully deleted ${deleteResult.count} unverified user(s)`,
            deletedCount: deleteResult.count,
            deletedUsers: unverifiedUsers.map(u => ({
                email: u.email,
                createdAt: u.createdAt
            }))
        });

    } catch (error: any) {
        console.error("Error cleaning up unverified users:", error);
        return NextResponse.json(
            {
                error: error.message || "Failed to cleanup unverified users",
                success: false
            },
            { status: 500 }
        );
    }
}
