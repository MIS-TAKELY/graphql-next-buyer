import { prisma } from "../../../../lib/db/prisma";
import { verifyEsewaSignature } from "../../../../servers/gql/modules/payment/paymentHelper";
import { notifyPaymentSuccess } from "../../../../services/orderNotification.service";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const data = searchParams.get("data");

    if (!data) {
      return NextResponse.redirect(
        new URL(
          "/payment/failed?message=Invalid payment data",
          process.env.NEXT_PUBLIC_APP_URL!
        )
      );
    }

    // Decode the data
    const decodedData = JSON.parse(
      Buffer.from(data, "base64").toString("utf-8")
    );

    // Verify eSewa HMAC signature (cryptographic proof from eSewa)
    if (!verifyEsewaSignature(decodedData)) {
      console.error("eSewa success callback: Invalid signature");
      return NextResponse.redirect(
        new URL(
          "/payment/failed?message=Invalid signature",
          process.env.NEXT_PUBLIC_APP_URL!
        )
      );
    }

    // Update payment in database
    const payment = await prisma.payment.findFirst({
      where: {
        transactionId: decodedData.transaction_uuid,
      },
      include: {
        order: true,
      },
    });

    if (!payment) {
      return NextResponse.redirect(
        new URL(
          "/payment/failed?message=Payment record not found",
          process.env.NEXT_PUBLIC_APP_URL!
        )
      );
    }

    // Verify this payment is for an ESEWA provider (prevent cross-provider replay)
    if (payment.provider !== "ESEWA") {
      console.error(`eSewa success callback: Payment provider mismatch. Expected ESEWA, got ${payment.provider}`);
      return NextResponse.redirect(
        new URL(
          "/payment/failed?message=Payment provider mismatch",
          process.env.NEXT_PUBLIC_APP_URL!
        )
      );
    }

    // Only process PENDING payments (idempotency + state guard)
    if (payment.status === "COMPLETED") {
      return NextResponse.redirect(
        new URL(
          `/payment/success?orderId=${payment.orderId}`,
          process.env.NEXT_PUBLIC_APP_URL!
        )
      );
    }

    if (payment.status !== "PENDING") {
      console.error(`eSewa success callback: Payment not in PENDING state, current: ${payment.status}`);
      return NextResponse.redirect(
        new URL(
          "/payment/failed?message=Payment already processed",
          process.env.NEXT_PUBLIC_APP_URL!
        )
      );
    }

    // Amount Validation Check
    const paidAmount = parseFloat(decodedData.total_amount.replace(/,/g, ''));
    const expectedAmount = parseFloat(payment.amount.toString());

    if (Math.abs(paidAmount - expectedAmount) > 0.01) {
      console.error(`Payment mismatch: Paid ${paidAmount}, Expected ${expectedAmount}`);
      return NextResponse.redirect(
        new URL(
          "/payment/failed?message=Payment amount mismatch",
          process.env.NEXT_PUBLIC_APP_URL!
        )
      );
    }

    // Atomic Transaction
    await prisma.$transaction(async (tx: any) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          esewaRefId: decodedData.refId,
          signature: decodedData.signature,
          verifiedAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: "CONFIRMED" },
      });

      // Sync seller order status
      await tx.sellerOrder.updateMany({
        where: { buyerOrderId: payment.orderId },
        data: { status: "CONFIRMED" },
      });
    });

    // Notify buyer about successful payment (fire-and-forget)
    const buyer = await prisma.user.findUnique({
      where: { id: payment.order.buyerId },
      select: { id: true, email: true, firstName: true, lastName: true, phoneNumber: true },
    });
    if (buyer) {
      notifyPaymentSuccess(
        buyer,
        payment.order.orderNumber,
        payment.amount.toString(),
        "eSewa"
      );
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL(
        `/payment/success?orderId=${payment?.orderId}`,
        process.env.NEXT_PUBLIC_APP_URL!
      )
    );
  } catch (error) {
    console.error("Error processing payment success:", error);
    return NextResponse.redirect(
      new URL(
        "/payment/failed?message=Payment processing error",
        process.env.NEXT_PUBLIC_APP_URL!
      )
    );
  }
}
