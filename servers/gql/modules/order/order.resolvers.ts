import { Prisma } from "../../../../app/generated/prisma";
import { prisma } from "../../../../lib/db/prisma";
import { generateOrderNumber } from "@/randomOrderNumber";
import { rateLimit } from "@/services/rateLimit.service";
import { delCache, getCache, setCache } from "@/services/redis.services";
import { notifyBuyerOrderCreated, notifySellerNewOrder, notifyOrderCancelled, notifyReturnUpdate, notifyBuyerDisputeSubmitted, notifySellerDisputeReceived } from "@/services/orderNotification.service";
import { requireAuth, requireBuyer, requireSeller } from "../../auth/auth";
import { GraphQLContext } from "../../context";
import { canPurchase } from "@/lib/guards/purchase-guard";

// interface OrderInput {
//   items: Array<{
//     variantId: string;
//     quantity: number;
//   }>;
//   shippingAddress: any;
//   billingAddress?: any;
//   paymentProvider: string;
//   paymentMethodId?: string;
//   shippingMethod: string;
// }

interface DiscountCalculation {
  discountAmount: number;
  appliedDiscounts: Array<{
    amount: number;
    originalAmount: number;
  }>;
}

// Single Order Item
export interface OrderItemInput {
  variantId: string;
  quantity: number;
}

// Address Type
export interface AddressInput {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  [key: string]: any;
}

// Shipping Method Enum
export enum ShippingMethod {
  STANDARD = "STANDARD",
  EXPRESS = "EXPRESS",
  SAME_DAY = "SAME_DAY",
}

// Payment Provider Enum
export enum PaymentProvider {
  COD = "COD",
  ESEWA = "ESEWA",
  PAYPAL = "PAYPAL",
  STRIPE = "STRIPE",
}

// Single Order Input
export interface OrderInput {
  items: OrderItemInput[];
  shippingAddress: AddressInput;
  billingAddress?: AddressInput | null;
  paymentProvider: PaymentProvider;
  paymentMethodId?: string | null;
  transactionId?: string | null;
  receiptUrl?: string | null;
  shippingMethod: ShippingMethod;
  idempotencyKey?: string | null;
}

type CreatedOrder = Prisma.OrderGetPayload<{
  include: {
    items: { include: { variant: true } };
    payments: true;
    shipments: true;
  };
}>;

export const orderResolvers = {
  Query: {
    getMyOrderItems: async (
      _: any,
      { limit, offset }: { limit: number; offset: number },
      ctx: GraphQLContext
    ) => {
      const user = requireBuyer(ctx);
      console.log("user--->", user);
      if (!user) throw new Error("Invalid user");

      return prisma.order.findMany({
        where: { buyerId: user.id },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: { orderBy: { sortOrder: 'asc' } },
                    },
                  },
                },
              },
            },
          },
          payments: true,
          shipments: true,
          disputes: true,
          sellerOrders: true,
        },
      }).then(orders => orders.map(order => {
        // Map cancellationReason from the first sellerOrder that has one, or undefined
        const cancellationReason = order.sellerOrders?.find((so: any) => so.cancellationReason)?.cancellationReason;
        return {
          ...order,
          cancellationReason,
        };
      }));
    },
    getDisputes: async (
      _: any,
      { limit, offset }: { limit: number; offset: number },
      ctx: GraphQLContext
    ) => {
      const user = requireBuyer(ctx);
      return prisma.orderDispute.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: {
          order: true,
        },
      });
    },
    getSellerDisputes: async (
      _: any,
      { limit, offset }: { limit: number; offset: number },
      ctx: GraphQLContext
    ) => {
      const user = requireSeller(ctx);
      return prisma.orderDispute.findMany({
        where: {
          sellerOrder: {
            sellerId: user.id,
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: {
          order: true,
          user: true,
        },
      });
    },
  },
  Mutation: {
    createOrder: async (
      _: any,
      { input }: { input: OrderInput[] },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      requireBuyer(ctx);
      console.log("input------>", input);

      // Enforce purchase guard: require email + phone verification
      const purchaseCheck = canPurchase(ctx.user);
      if (!purchaseCheck.allowed) {
        throw new Error(purchaseCheck.reason || "Purchase not allowed");
      }

      // Rate Limit: 5 orders per minute per user to prevent abuse
      const allowed = await rateLimit(`rate_limit:order:${user.id}`, 5, 60);
      if (!allowed) {
        throw new Error("Too many order attempts. Please wait a minute.");
      }

      // Idempotency check: if client provides an idempotency key, check for duplicate
      const idempotencyKey = input[0]?.idempotencyKey;
      if (idempotencyKey) {
        try {
          const cacheKey = `idempotency:order:${user.id}:${idempotencyKey}`;
          const existingOrderIds = await getCache<string[]>(cacheKey);
          if (existingOrderIds) {
            const existingOrders = await prisma.order.findMany({
              where: { id: { in: existingOrderIds } },
              include: {
                items: { include: { variant: true } },
                payments: true,
                shipments: true,
              },
            });
            if (existingOrders.length > 0) {
              return existingOrders;
            }
          }
        } catch (e) {
          console.error("Idempotency check failed:", e);
        }
      }

      const createdOrders: CreatedOrder[] = [];

      try {
        await prisma.$transaction(
          async (tx: any) => {
            for (const orderInput of input) {
              const variantIds = orderInput.items.map((i: any) => i.variantId);
              const variants = await tx.productVariant.findMany({
                where: { id: { in: variantIds } },
                include: {
                  product: {
                    select: {
                      id: true,
                      status: true,
                      sellerId: true,
                      categoryId: true,
                      slug: true,
                      seller: {
                        select: {
                          email: true,
                          phoneNumber: true,
                        },
                      },
                    },
                  },
                },
              });

              console.log("orderInput-->", orderInput);

              const byId = new Map(variants.map((v: any) => [v.id, v]));
              let subtotal = 0;

              const computedItems = orderInput.items.map((i: any) => {
                const v: any = byId.get(i.variantId);
                if (!v) throw new Error("Variant not found");
                if (v.product.status !== "ACTIVE")
                  throw new Error("Product inactive");
                if (v.stock !== null && v.stock < i.quantity)
                  throw new Error("Insufficient stock");

                const unitPrice = v.price.toNumber();
                const totalPrice = i.quantity * unitPrice;
                subtotal += totalPrice;

                return {
                  variantId: i.variantId,
                  quantity: i.quantity,
                  unitPrice,
                  totalPrice,
                  sellerId: v.product.sellerId,
                  productId: v.product.id,
                  categoryId: v.product.categoryId,
                };
              });

              const tax = 0; // Taxes removed per user request
              const shippingFee = 0;
              const discount = 0;
              const total = subtotal + tax + shippingFee - discount;
              const orderNumber = generateOrderNumber();

              const createdOrder = await tx.order.create({
                data: {
                  orderNumber,
                  buyerId: user.id,
                  status: "PENDING",
                  shippingSnapshot: orderInput.shippingAddress,
                  billingSnapshot: orderInput.billingAddress ?? Prisma.JsonNull,
                  subtotal,
                  tax,
                  shippingFee,
                  discount,
                  total,
                  items: {
                    create: computedItems.map((ci: any) => ({
                      variantId: ci.variantId,
                      quantity: ci.quantity,
                      unitPrice: ci.unitPrice,
                      totalPrice: ci.totalPrice,
                    })),
                  },
                  payments: {
                    create: {
                      amount: total,
                      currency: "NPR", // Switched from INR to NPR
                      status: "PENDING",
                      provider: orderInput.paymentProvider,
                      methodId: orderInput.paymentMethodId ?? null,
                      transactionId: orderInput.transactionId || undefined,
                      receiptUrl: orderInput.receiptUrl ?? null,
                      productCode: "",
                    },
                  },
                  shipments: {
                    create: {
                      method: orderInput.shippingMethod as any,
                      status: "PENDING",
                    },
                  },
                },
                include: {
                  items: { include: { variant: true } },
                  payments: true,
                  shipments: true,
                },
              });

              createdOrders.push(createdOrder);

              const itemsBySeller: Record<string, typeof computedItems> = {};
              for (const ci of computedItems) {
                if (!itemsBySeller[ci.sellerId])
                  itemsBySeller[ci.sellerId] = [];
                itemsBySeller[ci.sellerId].push(ci);
              }

              for (const [sellerId, items] of Object.entries(itemsBySeller)) {
                const sellerSubtotal = items.reduce(
                  (acc, i) => acc + Number(i.totalPrice),
                  0
                );
                const commission = 0; // Commission removed per user request

                await tx.sellerOrder.create({
                  data: {
                    buyerOrderId: createdOrder.id,
                    sellerId,
                    status: "PENDING",
                    subtotal: sellerSubtotal,
                    total: sellerSubtotal,
                    commission,
                    items: {
                      create: items.map((ci: any) => ({
                        variantId: ci.variantId,
                        quantity: ci.quantity,
                        unitPrice: ci.unitPrice,
                        totalPrice: ci.totalPrice,
                        commission: 0,
                      })),
                    },
                  },
                });
              }

              // Fix Race Condition: Use updateMany with 'gte' check to ensure sufficient stock at the exact moment of write.
              for (const ci of computedItems) {
                const res = await tx.productVariant.updateMany({
                  where: {
                    id: ci.variantId,
                    stock: { gte: ci.quantity },
                  },
                  data: {
                    stock: { decrement: ci.quantity },
                    soldCount: { increment: ci.quantity },
                  },
                });

                if (res.count === 0) {
                  throw new Error(
                    `Insufficient stock for item (Race condition detected)`
                  );
                }
              }
            }
          },
          { timeout: 15000 }
        );

        // Clear purchased cart items immediately after successful transaction
        const allPurchasedVariantIds = input.flatMap((orderInput) =>
          orderInput.items.map((i) => i.variantId)
        );
        if (allPurchasedVariantIds.length > 0) {
          await prisma.cartItem.deleteMany({
            where: {
              userId: user.id,
              variantId: { in: allPurchasedVariantIds },
            },
          });
          await Promise.all([
            delCache("carts:all"),
            delCache(`carts:user:${user.id}`),
          ]).catch(console.error);
        }

        // Store idempotency key for 5 minutes to prevent duplicate orders
        if (idempotencyKey) {
          const cacheKey = `idempotency:order:${user.id}:${idempotencyKey}`;
          try {
            await setCache(cacheKey, createdOrders.map((o) => o.id), 300);
          } catch (e) {
            console.error("Failed to set idempotency key:", e);
          }
        }

        // Invalidate cache for affected products (Stock update)
        for (const orderInput of input) {
          const variantIds = orderInput.items.map((i) => i.variantId);
          // We need to re-fetch or assume distinct slugs from the transaction block.
          // Simpler to just re-fetch slugs for invalidation safely outside tx.
          const products = await prisma.product.findMany({
            where: { variants: { some: { id: { in: variantIds } } } },
            select: { slug: true },
          });

          for (const p of products) {
            console.log(`🗑️ Invalidating cache for product: ${p.slug}`);
            const PRODUCT_CACHE_VERSION = 'v2';
            await delCache(`product:details:${PRODUCT_CACHE_VERSION}:${p.slug}`);
          }
        }

        // Send notifications to buyer and sellers (fire-and-forget, non-blocking)
        for (const createdOrder of createdOrders) {
          const orderTotal = createdOrder.total.toString();
          const orderNumber = (createdOrder as any).orderNumber;
          const paymentProvider = createdOrder.payments[0]?.provider || "N/A";

          // Notify buyer
          notifyBuyerOrderCreated(
            { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, phoneNumber: user.phoneNumber },
            orderNumber,
            orderTotal,
            paymentProvider
          );

          // Notify each seller
          const sellerOrders = await prisma.sellerOrder.findMany({
            where: { buyerOrderId: createdOrder.id },
            include: {
              seller: { select: { id: true, email: true, phoneNumber: true } },
            },
          });

          for (const so of sellerOrders) {
            notifySellerNewOrder(
              { id: so.seller.id, email: so.seller.email, phoneNumber: so.seller.phoneNumber },
              orderNumber,
              so.total.toString(),
              `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Customer",
              user.phoneNumber || "N/A",
              so.id,
              createdOrder.id
            );
          }
        }

        return createdOrders;
      } catch (error: any) {
        console.error("Error while creating orders:", error.message);
        throw new Error(error.message || "Failed to create orders");
      }
    },
    cancelOrder: async (
      _: any,
      { input }: { input: { orderId: string; reason: string } },
      ctx: GraphQLContext
    ) => {
      const user = requireBuyer(ctx);
      const order = await prisma.order.findUnique({
        where: { id: input.orderId },
        include: {
          shipments: true,
          payments: true,
          sellerOrders: {
            include: { seller: { select: { id: true, email: true, phoneNumber: true } } },
          },
        },
      });

      if (!order) throw new Error("Order not found");
      if (order.buyerId !== user.id) throw new Error("Unauthorized");

      // Prevent cancellation of already-cancelled or terminal-state orders
      if (order.status === "CANCELLED") {
        throw new Error("Order is already cancelled");
      }
      if (order.status === "RETURNED") {
        throw new Error("Cannot cancel a returned order");
      }
      if (order.status === "DELIVERED") {
        throw new Error("Cannot cancel a delivered order. Please request a return instead.");
      }

      // Check for existing pending cancel dispute to prevent duplicates
      const existingCancelDispute = await prisma.orderDispute.findFirst({
        where: {
          orderId: input.orderId,
          type: "CANCEL",
          status: { in: ["PENDING", "APPROVED"] },
        },
      });
      if (existingCancelDispute) {
        throw new Error("A cancellation request already exists for this order");
      }

      // Check for conflicting return dispute
      const existingReturnDispute = await prisma.orderDispute.findFirst({
        where: {
          orderId: input.orderId,
          type: "RETURN",
          status: { in: ["PENDING", "APPROVED"] },
        },
      });
      if (existingReturnDispute) {
        throw new Error("Cannot cancel an order with an active return request");
      }

      // Check if any shipment is already shipped
      const isShipped = order.shipments.some((s: any) =>
        ["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(
          s.status
        )
      );

      if (isShipped) {
        throw new Error("Cannot cancel order after it has been shipped");
      }

      // If status is PENDING, cancel immediately without dispute
      if (order.status === "PENDING") {
        const orderItems = await prisma.orderItem.findMany({
          where: { orderId: input.orderId },
          select: { variantId: true, quantity: true },
        });

        const hasCompletedPayment = order.payments.some(
          (p: any) => p.status === "COMPLETED"
        );

        await prisma.$transaction(async (tx: any) => {
          await tx.order.update({
            where: { id: input.orderId },
            data: { status: "CANCELLED" },
          });
          await tx.sellerOrder.updateMany({
            where: { buyerOrderId: input.orderId },
            data: { status: "CANCELLED" },
          });
          // Mark pending payments as FAILED
          await tx.payment.updateMany({
            where: { orderId: input.orderId, status: "PENDING" },
            data: { status: "FAILED" },
          });
          // Mark completed payments as REFUNDED
          if (hasCompletedPayment) {
            await tx.payment.updateMany({
              where: { orderId: input.orderId, status: "COMPLETED" },
              data: { status: "REFUNDED" },
            });
          }
          // Restore stock for all order items
          for (const item of orderItems) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        });

        // Notify buyer about cancellation (fire-and-forget)
        notifyOrderCancelled(
          { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, phoneNumber: user.phoneNumber },
          order.orderNumber,
          input.reason,
          hasCompletedPayment
        );

        return prisma.orderDispute.create({
          data: {
            orderId: input.orderId,
            userId: user.id,
            reason: input.reason,
            type: "CANCEL",
            status: "RESOLVED",
            description: hasCompletedPayment
              ? "Immediate cancellation by buyer (Order was PENDING, refund initiated)"
              : "Immediate cancellation by buyer (Order was PENDING)",
          },
        });
      }

      const dispute = await prisma.orderDispute.create({
        data: {
          orderId: input.orderId,
          userId: user.id,
          reason: input.reason,
          type: "CANCEL",
          status: "PENDING",
        },
      });

      // Notify buyer that cancellation request was submitted
      notifyBuyerDisputeSubmitted(
        { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, phoneNumber: user.phoneNumber },
        order.orderNumber,
        "CANCEL",
        input.reason
      );

      // Notify each seller about the cancellation request
      const customerName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Customer";
      for (const so of order.sellerOrders) {
        notifySellerDisputeReceived(
          so.seller,
          order.orderNumber,
          "CANCEL",
          input.reason,
          customerName
        );
      }

      return dispute;
    },
    requestReturn: async (
      _: any,
      {
        input,
      }: {
        input: {
          orderId: string;
          reason: string;
          description?: string;
          images?: string[];
        };
      },
      ctx: GraphQLContext
    ) => {
      const user = requireBuyer(ctx);
      const order = await prisma.order.findUnique({
        where: { id: input.orderId },
        include: {
          shipments: true,
          items: true,
          sellerOrders: {
            include: { seller: { select: { id: true, email: true, phoneNumber: true } } },
          },
        },
      });

      if (!order) throw new Error("Order not found");
      if (order.buyerId !== user.id) throw new Error("Unauthorized");

      // Check if order is delivered
      const isDelivered =
        order.status === "DELIVERED" ||
        (order.shipments as any[]).some((s: any) => s.status === "DELIVERED");

      if (!isDelivered) {
        throw new Error("Can only request return for delivered orders");
      }

      // Check if return already exists
      const existingReturn = await prisma.return.findFirst({
        where: { orderId: input.orderId },
      });

      if (existingReturn) {
        throw new Error("Return request already exists for this order");
      }

      // Check for conflicting cancel dispute
      const existingCancelDispute = await prisma.orderDispute.findFirst({
        where: {
          orderId: input.orderId,
          type: "CANCEL",
          status: { in: ["PENDING", "APPROVED"] },
        },
      });
      if (existingCancelDispute) {
        throw new Error("Cannot request return for an order with an active cancellation request");
      }

      // Create Return and ReturnItems
      const returnRequest = await prisma.return.create({
        data: {
          orderId: input.orderId,
          userId: user.id,
          reason: input.reason,
          description: input.description,
          images: input.images || [],
          type: "REFUND",
          status: "REQUESTED",
          items: {
            create: order.items.map((item) => ({
              orderItemId: item.id,
              quantity: item.quantity,
              reason: input.reason,
            })),
          },
        },
      });

      // Notify buyer that return request was submitted
      notifyBuyerDisputeSubmitted(
        { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, phoneNumber: user.phoneNumber },
        order.orderNumber,
        "RETURN",
        input.reason
      );

      // Notify each seller about the return request
      const customerName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Customer";
      for (const so of order.sellerOrders) {
        notifySellerDisputeReceived(
          so.seller,
          order.orderNumber,
          "RETURN",
          input.reason,
          customerName
        );
      }

      return returnRequest;
    },
    updateDisputeStatus: async (
      _: any,
      { disputeId, status }: { disputeId: string; status: any },
      ctx: GraphQLContext
    ) => {
      const user = requireSeller(ctx);

      const dispute = await prisma.orderDispute.findUnique({
        where: { id: disputeId },
        include: {
          order: {
            include: {
              sellerOrders: true,
              buyer: { select: { id: true, email: true, firstName: true, lastName: true, phoneNumber: true } },
            },
          },
        },
      });

      if (!dispute) throw new Error("Dispute not found");

      // Ensure the seller owns one of the sellerOrders in this order
      const isMyOrder = (dispute.order.sellerOrders as any[]).some(
        (so: any) => so.sellerId === user.id
      );
      if (!isMyOrder) throw new Error("Unauthorized");

      const updatedDispute = await prisma.orderDispute.update({
        where: { id: disputeId },
        data: { status },
      });

      // If approved and type is CANCEL, update order status, restore stock, and update payments
      if (status === "APPROVED") {
        if (updatedDispute.type === "CANCEL") {
          const orderItems = await prisma.orderItem.findMany({
            where: { orderId: updatedDispute.orderId },
            select: { variantId: true, quantity: true },
          });

          await prisma.$transaction(async (tx: any) => {
            await tx.order.update({
              where: { id: updatedDispute.orderId },
              data: { status: "CANCELLED" },
            });
            await tx.sellerOrder.updateMany({
              where: { buyerOrderId: updatedDispute.orderId },
              data: { status: "CANCELLED" },
            });
            // Mark pending payments as FAILED
            await tx.payment.updateMany({
              where: { orderId: updatedDispute.orderId, status: "PENDING" },
              data: { status: "FAILED" },
            });
            // Mark completed payments as REFUNDED
            await tx.payment.updateMany({
              where: { orderId: updatedDispute.orderId, status: "COMPLETED" },
              data: { status: "REFUNDED" },
            });
            // Restore stock for all cancelled order items
            for (const item of orderItems) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              });
            }
          });
        } else if (updatedDispute.type === "RETURN") {
          const orderItems = await prisma.orderItem.findMany({
            where: { orderId: updatedDispute.orderId },
            select: { variantId: true, quantity: true },
          });

          await prisma.$transaction(async (tx: any) => {
            await tx.order.update({
              where: { id: updatedDispute.orderId },
              data: { status: "RETURNED" },
            });
            await tx.sellerOrder.updateMany({
              where: { buyerOrderId: updatedDispute.orderId },
              data: { status: "RETURNED" },
            });
            // Mark completed payments as REFUNDED for returns
            await tx.payment.updateMany({
              where: { orderId: updatedDispute.orderId, status: "COMPLETED" },
              data: { status: "REFUNDED" },
            });
            // Restore stock for returned items
            for (const item of orderItems) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              });
            }
          });
        }
      }

      // Notify buyer about dispute resolution (fire-and-forget)
      if (status === "APPROVED" && dispute.order.buyer) {
        const buyer = dispute.order.buyer;
        if (updatedDispute.type === "CANCEL") {
          notifyOrderCancelled(
            buyer,
            dispute.order.orderNumber,
            updatedDispute.reason || "Cancellation approved",
            true
          );
        } else if (updatedDispute.type === "RETURN") {
          notifyReturnUpdate(
            buyer,
            dispute.order.orderNumber,
            "Approved",
          );
        }
      }

      return updatedDispute;
    },
  },
};
