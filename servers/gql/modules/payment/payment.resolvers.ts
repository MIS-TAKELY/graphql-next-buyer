import { prisma } from "../../../../lib/db/prisma";
import {
  generateTransactionUuid,
  prepareEsewaPaymentData,
  verifyEsewaSignature,
  prepareFonepayPaymentData,
  verifyFonepaySignature,
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
        // Check user authentication
        if (!context.user) {
          throw new Error("Authentication required");
        }

        // Fetch order with validation
        const order = await prisma.order.findFirst({
          where: {
            id: orderId,
            buyerId: context.user.id,
            status: "PENDING",
          },
          include: {
            payments: true,
          },
        });

        if (!order) {
          throw new Error("Order not found or already processed");
        }

        // Check if payment already exists
        const existingPayment = order.payments.find(
          (p: any) => p.status === "PENDING"
        );
        console.log("existingPayment-->", existingPayment);
        if (existingPayment) {
          // Return existing payment data
          const paymentData = prepareEsewaPaymentData(
            parseFloat(order.total.toString()),
            existingPayment.transactionId!
          );

          return {
            success: true,
            paymentUrl: process.env.ESEWA_API_URL,
            paymentData,
          };
        }

        // Create new payment record
        const transactionId = generateTransactionUuid();
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

        // Prepare eSewa payment data
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
        return {
          success: false,
          error: error.message,
        };
      }
    },

    verifyEsewaPayment: async (
      _: any,
      { data }: { data: string },
      context: GraphQLContext
    ) => {
      // ... (existing verifyEsewaPayment code)
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

        const transactionId = generateTransactionUuid();

        // In a real scenario, you'd get the seller's MSISDN from their profile
        // Here we'll use a placeholder or the first seller in the order
        const merchantCode = process.env.FONEPAY_MERCHANT_CODE || "TEST_MERCHANT";

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

        const qrValue = `fonepay://pay?msisdn=${merchantCode}&amount=${order.total}&ref=${transactionId}`;

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
