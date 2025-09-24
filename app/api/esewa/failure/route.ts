import { PrismaClient } from "@/app/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const transactionUuid = searchParams.get("transaction_uuid");

    if (transactionUuid) {
      // Update payment status to failed
      await prisma.payment.updateMany({
        where: {
          transactionId: transactionUuid,
        },
        data: {
          status: "FAILED",
        },
      });
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
