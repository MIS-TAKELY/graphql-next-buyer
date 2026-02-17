import { prisma } from "../../../../lib/db/prisma";
import { verifyEsewaSignature } from "../../../../servers/gql/modules/payment/paymentHelper";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const data = searchParams.get("data");
    const transactionUuid = searchParams.get("transaction_uuid");

    // eSewa may send either a signed `data` param or just `transaction_uuid`.
    // If `data` is present, verify its signature for authenticity.
    // If only `transaction_uuid`, we do NOT cancel — let the cron job handle it.
    // This prevents an attacker from cancelling orders by hitting this URL with arbitrary UUIDs.

    let verifiedTransactionUuid: string | null = null;

    if (data) {
      try {
        const decodedData = JSON.parse(
          Buffer.from(data, "base64").toString("utf-8")
        );
        if (verifyEsewaSignature(decodedData)) {
          verifiedTransactionUuid = decodedData.transaction_uuid;
        } else {
          console.error("eSewa failure callback: Invalid signature");
        }
      } catch (parseError) {
        console.error("eSewa failure callback: Failed to parse data", parseError);
      }
    }

    if (verifiedTransactionUuid) {
      const payment = await prisma.payment.findFirst({
        where: { transactionId: verifiedTransactionUuid, provider: "ESEWA" },
        select: { id: true, orderId: true, status: true },
      });

      if (payment && payment.status === "PENDING") {
        const orderItems = await prisma.orderItem.findMany({
          where: { orderId: payment.orderId },
          select: { variantId: true, quantity: true },
        });

        await prisma.$transaction(async (tx: any) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: "FAILED" },
          });

          await tx.order.update({
            where: { id: payment.orderId },
            data: { status: "CANCELLED" },
          });

          await tx.sellerOrder.updateMany({
            where: { buyerOrderId: payment.orderId },
            data: { status: "CANCELLED" },
          });

          for (const item of orderItems) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        });
      }
    } else if (transactionUuid) {
      // Unsigned request — only log, do NOT cancel.
      // The cron job will handle expired unpaid orders.
      console.warn(
        `eSewa failure callback: Unsigned request for transaction ${transactionUuid}. Skipping cancellation — cron will handle.`
      );
    }

    return NextResponse.redirect(
      new URL("/payment/failed", process.env.NEXT_PUBLIC_APP_URL!)
    );
  } catch (error) {
    console.error("Error processing payment failure:", error);
    return NextResponse.redirect(
      new URL("/payment/failed", process.env.NEXT_PUBLIC_APP_URL!)
    );
  }
}
