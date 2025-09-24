import { PrismaClient } from "@/app/generated/prisma";
import { verifyEsewaSignature } from "@/servers/gql/modules/payment/paymentHelper";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

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

    // Verify signature
    if (!verifyEsewaSignature(decodedData)) {
      return NextResponse.redirect(
        new URL(
          "/payment/failed?message=Invalid signature",
          process.env.NEXT_PUBLIC_APP_URL!
        )
      );
    }

    // Update payment in database
    const payment = await prisma.payment.findUnique({
      where: {
        transactionId: decodedData.transaction_uuid,
      },
    });

    if (payment) {
      await prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: "COMPLETED",
          esewaRefId: decodedData.refId,
          signature: decodedData.signature,
          verifiedAt: new Date(),
        },
      });

      // Update order status
      await prisma.order.update({
        where: {
          id: payment.orderId,
        },
        data: {
          status: "CONFIRMED",
        },
      });
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
