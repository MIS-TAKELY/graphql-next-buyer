import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret) {
            console.error("CRON_SECRET not configured");
            return NextResponse.json(
                { error: "Cron job not configured" },
                { status: 500 }
            );
        }

        if (authHeader !== `Bearer ${cronSecret}`) {
            console.error("Unauthorized cron job attempt");
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

        const expiredOrders = await prisma.order.findMany({
            where: {
                status: "PENDING",
                createdAt: { lt: thirtyMinutesAgo },
                payments: {
                    some: {},
                    none: {
                        status: { notIn: ["PENDING", "FAILED"] },
                    },
                    every: {
                        provider: { not: "COD" },
                    },
                },
            },
            select: {
                id: true,
                orderNumber: true,
                items: {
                    select: { variantId: true, quantity: true },
                },
            },
        });

        if (expiredOrders.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No expired orders found",
                cancelledCount: 0,
            });
        }

        let cancelledCount = 0;

        for (const order of expiredOrders) {
            try {
                await prisma.$transaction(async (tx: any) => {
                    await tx.order.update({
                        where: { id: order.id },
                        data: { status: "CANCELLED" },
                    });

                    await tx.sellerOrder.updateMany({
                        where: { buyerOrderId: order.id },
                        data: { status: "CANCELLED" },
                    });

                    await tx.payment.updateMany({
                        where: { orderId: order.id, status: "PENDING" },
                        data: { status: "FAILED" },
                    });

                    for (const item of order.items) {
                        await tx.productVariant.update({
                            where: { id: item.variantId },
                            data: { stock: { increment: item.quantity } },
                        });
                    }
                });

                cancelledCount++;
                console.log(`Cancelled expired order: ${order.orderNumber}`);
            } catch (orderError) {
                console.error(
                    `Failed to cancel order ${order.orderNumber}:`,
                    orderError
                );
            }
        }

        console.log(
            `Expired orders cleanup: cancelled ${cancelledCount}/${expiredOrders.length} orders`
        );

        return NextResponse.json({
            success: true,
            message: `Cancelled ${cancelledCount} expired order(s)`,
            cancelledCount,
            totalFound: expiredOrders.length,
        });
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Failed to cleanup expired orders";
        console.error("Error cleaning up expired orders:", error);
        return NextResponse.json(
            { error: message, success: false },
            { status: 500 }
        );
    }
}
