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

    verifyEsewaPayment: async (
      _: any,
      { data }: { data: string },
      context: GraphQLContext
    ) => {
      try {
        if (!context.user) throw new Error("Authentication required");

        const decodedData = JSON.parse(
          Buffer.from(data, "base64").toString("utf-8")
        );

        const isValid = verifyEsewaSignature(decodedData);
        if (!isValid) throw new Error("Invalid eSewa signature");

        const payment = await prisma.payment.findUnique({
          where: { transactionId: decodedData.transaction_uuid },
          include: { order: true },
        });

        if (!payment) throw new Error("Payment record not found");

        if (decodedData.status === "COMPLETE") {
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
        }

        return {
          success: true,
          payment: payment as any,
          order: payment.order as any,
          message: "eSewa payment verified successfully",
        };
      } catch (error: any) {
        console.error("Error verifying eSewa payment:", error);
        return { success: false, message: error.message };
      }
    },

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
