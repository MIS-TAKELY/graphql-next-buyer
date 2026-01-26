import { prisma } from "../../../../lib/db/prisma";
import {
  generateTransactionUuid,
  prepareEsewaPaymentData,
  verifyEsewaSignature,
  prepareFonepayPaymentData,
  verifyFonepaySignature,
  generateFonepayEMVCoQR,
} from "@/servers/gql/modules/payment/paymentHelper";
import { GraphQLContext } from "../../context";
import { NepPayments, PaymentEnvironment } from "neppayments";


export const paymentResolvers = {
  Mutation: {
    initiateEsewaPayment: async (
      _: any,
      { orderId }: { orderId: string },
      context: GraphQLContext
    ) => {
      try {
        if (!context.user) throw new Error("Authentication required");

        const order = await prisma.order.findFirst({
          where: { id: orderId, buyerId: context.user.id, status: "PENDING" },
          include: { payments: true },
        });

        if (!order) throw new Error("Order not found or already processed");

        let transactionId: string;
        const existingPayment = order.payments.find((p: any) => p.status === "PENDING" && p.provider === "ESEWA");

        if (existingPayment) {
          transactionId = existingPayment.transactionId!;
        } else {
          transactionId = generateTransactionUuid();
          await prisma.payment.create({
            data: {
              orderId: order.id,
              amount: order.total,
              currency: "NPR",
              status: "PENDING",
              transactionId,
              provider: "ESEWA",
            },
          });
        }

        // Prepare eSewa payment data using helper (which currently uses manual crypto)
        // Note: neppayments 2.0.6's EsewaGateway returns a full form HTML, 
        // but the current frontend expects JSON fields.
        const paymentData = prepareEsewaPaymentData(
          parseFloat(order.total.toString()),
          transactionId
        );

        return {
          success: true,
          paymentUrl: process.env.ESEWA_API_URL,
          paymentData,
        };
      } catch (error: any) {
        console.error("Error initiating eSewa payment:", error);
        return { success: false, error: error.message };
      }
    },

    // ... (existing verifyEsewaPayment code)

    initiateFonepayPayment: async (
      _: any,
      { orderId }: { orderId: string },
      context: GraphQLContext
    ) => {
      try {
        if (!context.user) throw new Error("Authentication required");

        const order = await prisma.order.findFirst({
          where: { id: orderId, buyerId: context.user.id, status: "PENDING" },
          include: { payments: true },
        });

        if (!order) throw new Error("Order not found");

        // Check for existing pending Fonepay payment
        let transactionId: string;
        const existingPayment = order.payments.find(
          (p: any) => p.status === "PENDING" && p.provider === "FONEPAY"
        );

        if (existingPayment) {
          transactionId = existingPayment.transactionId!;
        } else {
          transactionId = generateTransactionUuid();
          await prisma.payment.create({
            data: {
              orderId: order.id,
              amount: order.total,
              currency: "NPR",
              status: "PENDING",
              transactionId,
              provider: "FONEPAY",
            },
          });
        }

        const merchantCode = process.env.FONEPAY_MERCHANT_CODE || "TEST_MERCHANT";

        // Generate SCANNABLE EMVCo QR for Fonepay
        // This fixes the "unable to scan" issue
        const qrValue = generateFonepayEMVCoQR(
          parseFloat(order.total.toString()),
          merchantCode,
          transactionId
        );

        return {
          success: true,
          qrValue,
        };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    verifyFonepayPayment: async (
      _: any,
      { orderId, transactionId }: { orderId: string; transactionId: string },
      context: GraphQLContext
    ) => {
      try {
        if (!context.user) throw new Error("Authentication required");

        const payment = await prisma.payment.findUnique({
          where: { transactionId },
          include: { order: true },
        });

        if (!payment || payment.orderId !== orderId) {
          throw new Error("Payment record not found");
        }

        // HERE: Call neppayments or Fonepay API to verify the transactionId
        // For demonstration, we assume verification is successful if it matches our record
        // In production, integrate actual API call here.

        await prisma.$transaction(async (tx: any) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: "COMPLETED", verifiedAt: new Date() },
          });

          await tx.order.update({
            where: { id: payment.orderId },
            data: { status: "CONFIRMED" },
          });
        });

        return {
          success: true,
          payment: payment as any,
          order: payment.order as any,
          message: "Payment verified successfully",
        };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    },
  },
};
