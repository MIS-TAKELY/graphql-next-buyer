// app/api/payment/esewa/success/route.ts:

// import { NextRequest, NextResponse } from "next/server";
// import { verifyEsewaPayment } from "@/lib/esewa";
// import { prisma } from "@/lib/prisma"; // assuming you use Prisma

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const refId = searchParams.get("refId"); // returned by eSewa
//     const oid = searchParams.get("oid"); // your order/payment id
//     const amt = searchParams.get("amt");

//     if (!refId || !oid || !amt) {
//       return NextResponse.json({ error: "Missing params" }, { status: 400 });
//     }

//     const verified = await verifyEsewaPayment({
//       amount: Number(amt),
//       refId,
//       pid: oid,
//     });

//     if (!verified) {
//       await prisma.payment.update({
//         where: { transactionId: oid },
//         data: { status: "FAILED" },
//       });

//       return NextResponse.json({ success: false, message: "Verification failed" });
//     }

//     // ✅ Payment confirmed
//     await prisma.payment.update({
//       where: { transactionId: oid },
//       data: { status: "COMPLETED", providerPaymentId: refId },
//     });

//     await prisma.order.update({
//       where: { id: oid },
//       data: { status: "CONFIRMED" },
//     });

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }



// app/api/payment/esewa/failure/route.ts:


// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const oid = searchParams.get("oid");

//   if (oid) {
//     await prisma.payment.update({
//       where: { transactionId: oid },
//       data: { status: "FAILED" },
//     });

//     await prisma.order.update({
//       where: { id: oid },
//       data: { status: "CANCELLED" },
//     });
//   }

//   return NextResponse.json({ success: false, message: "Payment failed" });
// }
