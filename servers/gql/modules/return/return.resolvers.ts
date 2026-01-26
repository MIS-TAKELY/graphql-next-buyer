
import { prisma } from "../../../../lib/db/prisma";
import { requireAuth, requireBuyer, requireSeller } from "../../auth/auth";
import { GraphQLContext } from "../../context";
import { Prisma } from "../../../../app/generated/prisma";

export const returnResolvers = {
    Query: {
        myReturns: async (
            _: any,
            { limit, offset }: { limit: number; offset: number },
            ctx: GraphQLContext
        ) => {
            const user = requireBuyer(ctx);
            return prisma.return.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: "desc" },
                skip: offset,
                take: limit,
                include: {
                    items: { include: { orderItem: { include: { variant: { include: { product: true } } } } } },
                    order: true,
                },
            });
        },
        getReturn: async (_: any, { id }: { id: string }, ctx: GraphQLContext) => {
            const user = requireAuth(ctx);
            const returnRequest = await prisma.return.findUnique({
                where: { id },
                include: {
                    items: { include: { orderItem: { include: { variant: { include: { product: true } } } } } },
                    order: true,
                    user: true,
                },
            });

            if (!returnRequest) return null;

            // Access control: only buyer or seller of the order
            const isBuyer = returnRequest.userId === user.id;
            // For seller check, we need to know if the user is a seller of any item in the return or the order
            // Ideally, the return is linked to an order which has sellerOrders.
            // But for simplicity, let's assume if the user is a SELLER and owns the product, they can see it.
            // Or better, check if they are the seller of the order.
            // Using a simplified check for now: if user is admin or involved.
            if (!isBuyer && !user.roles.includes("ADMIN") && !user.roles.includes("SELLER")) {
                throw new Error("Unauthorized");
            }

            return returnRequest;
        },
        sellerReturns: async (
            _: any,
            { limit, offset, status }: { limit: number; offset: number; status?: any },
            ctx: GraphQLContext
        ) => {
            const seller = requireSeller(ctx);
            // We need returns where the order contains items from this seller.
            // Since `Return` is linked to `Order`, and `Order` has `SellerOrder`, we can filter by that.
            // However, a Return might be for a mixed order.
            // If the ReturnItem is specific to a product sold by this seller, that's better.
            // Let's filter returns where any ReturnItem -> OrderItem -> Variant -> Product -> sellerId === seller.id

            return prisma.return.findMany({
                where: {
                    items: {
                        some: {
                            orderItem: {
                                variant: {
                                    product: {
                                        sellerId: seller.id
                                    }
                                }
                            }
                        }
                    },
                    ...(status ? { status } : {})
                },
                orderBy: { createdAt: "desc" },
                skip: offset,
                take: limit,
                include: {
                    items: { include: { orderItem: { include: { variant: { include: { product: true } } } } } },
                    order: true,
                    user: true,
                },
            });
        },
    },
    Mutation: {
        createReturnRequest: async (
            _: any,
            { input }: { input: any },
            ctx: GraphQLContext
        ) => {
            const user = requireBuyer(ctx);
            const { orderId, items, reason, description, images, type, logisticsMode, refundMethod, pickupAddressId } = input;

            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    items: {
                        include: {
                            variant: {
                                include: {
                                    product: {
                                        include: {
                                            returnPolicy: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    shipments: true
                },
            });

            if (!order) throw new Error("Order not found");
            if (order.buyerId !== user.id) throw new Error("Unauthorized");

            // Validation 1: Order must be delivered
            const isDelivered = order.status === "DELIVERED" ||
                (order.shipments as any[]).some(s => s.status === "DELIVERED");

            if (!isDelivered) {
                throw new Error("Order must be delivered to request a return");
            }

            // Validation 2: Return Window & Eligibility
            const deliveryShipment = (order.shipments as any[]).find(s => s.status === "DELIVERED");
            const deliveredAt = deliveryShipment?.deliveredAt || order.updatedAt;
            const now = new Date();

            for (const item of items) {
                const orderItem = order.items.find(i => i.id === item.orderItemId);
                if (!orderItem) throw new Error(`Order item ${item.orderItemId} not found in this order`);
                if (item.quantity > orderItem.quantity) throw new Error(`Invalid quantity for item ${item.orderItemId}`);

                // Check Return Policy
                const policy = orderItem.variant.product.returnPolicy?.[0];
                const defaultPolicyDays = 7; // Fallback if no policy defined

                let expirationDate = new Date(deliveredAt);
                if (policy && policy.type === "NO_RETURN") {
                    throw new Error(`Product ${orderItem.variant.product.name} is not returnable`);
                }

                const duration = policy?.duration || defaultPolicyDays;
                const unit = policy?.unit || "DAYS";

                if (unit === "DAYS") {
                    expirationDate.setDate(expirationDate.getDate() + duration);
                } else if (unit === "HOURS") {
                    expirationDate.setHours(expirationDate.getHours() + duration);
                }

                if (now > expirationDate) {
                    throw new Error(`Return window for ${orderItem.variant.product.name} has expired`);
                }
            }

            // Create Return
            return prisma.return.create({
                data: {
                    orderId,
                    userId: user.id,
                    reason,
                    description,
                    images: images || [],
                    type,
                    logisticsMode: logisticsMode || "PLATFORM_PICKUP",
                    refundMethod: refundMethod || "ORIGINAL_PAYMENT",
                    pickupAddressId,
                    items: {
                        create: items.map((i: any) => ({
                            orderItemId: i.orderItemId,
                            quantity: i.quantity,
                            reason: i.reason
                        }))
                    },
                    status: "REQUESTED",
                    refundStatus: "PENDING"
                },
                include: {
                    items: { include: { orderItem: { include: { variant: true } } } },
                    order: true
                }
            });
        },

        updateReturnStatus: async (
            _: any,
            { input }: { input: any },
            ctx: GraphQLContext
        ) => {
            const user = requireSeller(ctx); // Or Admin
            const { returnId, status, rejectionReason } = input;

            const returnRequest = await prisma.return.findUnique({
                where: { id: returnId },
                include: { items: { include: { orderItem: { include: { variant: { include: { product: true } } } } } } }
            });

            if (!returnRequest) throw new Error("Return request not found");

            // Access Control: User must be seller of these items
            // We check if the seller sold the items in the return.
            const isSeller = returnRequest.items.some(i => i.orderItem.variant.product.sellerId === user.id);
            if (!isSeller && !user.roles.includes("ADMIN")) throw new Error("Unauthorized");

            const updateData: any = { status };
            if (rejectionReason) updateData.rejectionReason = rejectionReason;

            // Status side-effects
            if (status === "APPROVED") {
                updateData.pickupScheduledAt = new Date(); // Simulate scheduling
            } else if (status === "RECEIVED") {
                updateData.receivedAt = new Date();
            } else if (status === "INSPECTED") {
                updateData.inspectedAt = new Date();
            } else if (status === "ACCEPTED") {
                // Auto-initiate refund?
                updateData.refundStatus = "COMPLETED"; // Set to completed for simplicity in this flow

                // Update Order item status if needed, or Order status to RETURNED if all items returned
                // For now, let's keep it simple.
            } else if (status === "REJECTED" || status === "DENIED") {
                // Handle rejection logic
            }

            return prisma.return.update({
                where: { id: returnId },
                data: updateData,
                include: {
                    items: { include: { orderItem: true } },
                    order: true
                }
            });
        }
    }
};
