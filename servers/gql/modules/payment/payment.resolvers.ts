import { PrismaClient } from "@/app/generated/prisma";
import {
  generateTransactionUuid,
  prepareEsewaPaymentData,
  verifyEsewaSignature,
} from "@/servers/gql/modules/payment/paymentHelper";
import { GraphQLContext } from "../../context";

const prisma = new PrismaClient();

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
          (p) => p.status === "PENDING"
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
      try {
        // Decode the base64 data from eSewa
        const decodedData = JSON.parse(
          Buffer.from(data, "base64").toString("utf-8")
        );

        // Verify signature
        if (!verifyEsewaSignature(decodedData)) {
          throw new Error("Invalid payment signature");
        }

        // Find payment by transaction ID
        const payment = await prisma.payment.findUnique({
          where: {
            transactionId: decodedData.transaction_uuid,
          },
          include: {
            order: {
              include: {
                items: {
                  include: {
                    variant: {
                      include: {
                        product: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!payment) {
          throw new Error("Payment not found");
        }

        // Update payment status
        const updatedPayment = await prisma.payment.update({
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
        const updatedOrder = await prisma.order.update({
          where: {
            id: payment.orderId,
          },
          data: {
            status: "CONFIRMED",
          },
        });

        // Update stock quantities
        for (const item of payment.order.items) {
          await prisma.productVariant.update({
            where: {
              id: item.variantId,
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        // Clear user's cart
        await prisma.cartItem.deleteMany({
          where: {
            userId: payment.order.buyerId,
          },
        });

        return {
          success: true,
          payment: updatedPayment,
          order: updatedOrder,
          message: "Payment verified successfully",
        };
      } catch (error: any) {
        console.error("Error verifying payment:", error);
        return {
          success: false,
          message: error.message,
        };
      }
    },
  },
};
