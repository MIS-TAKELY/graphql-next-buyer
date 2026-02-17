import { prisma } from "../../../../lib/db/prisma";
import { rateLimit } from "@/services/rateLimit.service";
import { notifyBuyerStatusChange } from "@/services/orderNotification.service";
import { requireSeller } from "../../auth/auth";
import { GraphQLContext } from "../../context";

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  RETURNED: [],
};

export const sellerOrderResolvers = {
  Query: {
    getSellerOrders: async (
      _: any,
      { limit, offset, status }: { limit: number; offset: number; status?: string },
      ctx: GraphQLContext
    ) => {
      const user = requireSeller(ctx);
      return prisma.sellerOrder.findMany({
        where: {
          sellerId: user.id,
          ...(status ? { status: status as any } : {}),
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
                  },
                },
              },
            },
          },
          order: {
            include: {
              buyer: { select: { id: true, firstName: true, lastName: true, phoneNumber: true, email: true } },
              shipments: true,
              payments: true,
            },
          },
        },
      });
    },
  },
  Mutation: {
    updateSellerOrderStatus: async (
      _: any,
      { sellerOrderId, status, cancellationReason, trackingNumber, carrier }: {
        sellerOrderId: string;
        status: string;
        cancellationReason?: string;
        trackingNumber?: string;
        carrier?: string;
      },
      ctx: GraphQLContext
    ) => {
      const user = requireSeller(ctx);

      const allowed = await rateLimit(`rate_limit:seller_order:${user.id}`, 20, 60);
      if (!allowed) {
        throw new Error("Too many requests. Please wait a minute.");
      }

      const sellerOrder = await prisma.sellerOrder.findUnique({
        where: { id: sellerOrderId },
        include: {
          order: {
            include: {
              sellerOrders: true,
              shipments: true,
              payments: true,
              buyer: { select: { id: true, email: true, firstName: true, lastName: true, phoneNumber: true } },
            },
          },
          items: { select: { variantId: true, quantity: true } },
        },
      });

      if (!sellerOrder) throw new Error("Seller order not found");
      if (sellerOrder.sellerId !== user.id) throw new Error("Unauthorized");

      const currentStatus = sellerOrder.status;
      const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];

      if (!allowedTransitions.includes(status)) {
        throw new Error(
          `Cannot transition from ${currentStatus} to ${status}. Allowed: ${allowedTransitions.join(", ") || "none"}`
        );
      }

      await prisma.$transaction(async (tx: any) => {
        const updateData: Record<string, unknown> = { status };
        if (cancellationReason && status === "CANCELLED") {
          updateData.cancellationReason = cancellationReason;
        }
        await tx.sellerOrder.update({
          where: { id: sellerOrderId },
          data: updateData,
        });

        if (status === "CANCELLED") {
          for (const item of sellerOrder.items) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
          await tx.payment.updateMany({
            where: { orderId: sellerOrder.buyerOrderId, status: "PENDING" },
            data: { status: "FAILED" },
          });
          const hasCompletedPayment = sellerOrder.order.payments.some(
            (p: { status: string }) => p.status === "COMPLETED"
          );
          if (hasCompletedPayment) {
            await tx.payment.updateMany({
              where: { orderId: sellerOrder.buyerOrderId, status: "COMPLETED" },
              data: { status: "REFUNDED" },
            });
          }
        }

        if (status === "SHIPPED") {
          const shipment = sellerOrder.order.shipments[0];
          if (shipment) {
            await tx.shipment.update({
              where: { id: shipment.id },
              data: {
                status: "SHIPPED",
                shippedAt: new Date(),
                ...(trackingNumber ? { trackingNumber } : {}),
                ...(carrier ? { carrier } : {}),
              },
            });
          }
        }

        if (status === "DELIVERED") {
          const shipment = sellerOrder.order.shipments[0];
          if (shipment) {
            await tx.shipment.update({
              where: { id: shipment.id },
              data: {
                status: "DELIVERED",
                deliveredAt: new Date(),
              },
            });
          }
        }

        // Sync parent order status based on all seller orders
        const allSellerOrders = await tx.sellerOrder.findMany({
          where: { buyerOrderId: sellerOrder.buyerOrderId },
        });

        const allStatuses = allSellerOrders.map((so: { status: string }) => so.status);

        let parentStatus: string | null = null;
        if (allStatuses.every((s: string) => s === "CANCELLED")) {
          parentStatus = "CANCELLED";
        } else if (allStatuses.every((s: string) => s === "DELIVERED")) {
          parentStatus = "DELIVERED";
        } else if (allStatuses.some((s: string) => s === "SHIPPED" || s === "DELIVERED")) {
          parentStatus = "SHIPPED";
        } else if (allStatuses.some((s: string) => s === "PROCESSING")) {
          parentStatus = "PROCESSING";
        } else if (allStatuses.every((s: string) => s === "CONFIRMED" || s === "CANCELLED")) {
          parentStatus = "CONFIRMED";
        }

        if (parentStatus) {
          await tx.order.update({
            where: { id: sellerOrder.buyerOrderId },
            data: { status: parentStatus },
          });
        }
      });

      // Notify buyer about status change only when the parent order status actually changed
      const updatedOrder = await prisma.order.findUnique({
        where: { id: sellerOrder.buyerOrderId },
        select: { status: true },
      });
      const parentStatusChanged = updatedOrder && updatedOrder.status !== sellerOrder.order.status;
      const buyer = sellerOrder.order.buyer;
      if (buyer && parentStatusChanged) {
        notifyBuyerStatusChange(
          buyer,
          sellerOrder.order.orderNumber,
          updatedOrder.status,
          sellerOrder.order.status,
          sellerOrderId,
          sellerOrder.buyerOrderId,
          sellerOrder.order.total.toString(),
          { trackingNumber, carrier, cancellationReason }
        );
      }

      return prisma.sellerOrder.findUnique({
        where: { id: sellerOrderId },
        include: {
          items: { include: { variant: { include: { product: true } } } },
          order: {
            include: {
              buyer: { select: { id: true, firstName: true, lastName: true, email: true } },
              shipments: true,
            },
          },
        },
      });
    },
  },
};
