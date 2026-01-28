import { GraphQLError } from "graphql";
import { GraphQLContext } from "../../context";
import { sendEmailNotification, sendWhatsAppNotification } from "./notificationService";

export const productNotificationResolvers = {
    Query: {
        hasActiveNotification: async (
            _: any,
            { productId, variantId }: { productId: string; variantId?: string },
            context: GraphQLContext
        ) => {
            const { prisma, user } = context;

            if (!user) {
                return false;
            }

            const notification = await prisma.productNotification.findFirst({
                where: {
                    productId,
                    variantId: variantId || null,
                    userId: user.id,
                    isNotified: false,
                },
            });

            return !!notification;
        },
    },

    Mutation: {
        createProductNotification: async (
            _: any,
            { input }: { input: { productId: string; variantId?: string; email?: string; phone?: string } },
            context: GraphQLContext
        ) => {
            const { prisma, user } = context;

            // Validate input
            if (!user && !input.email && !input.phone) {
                throw new GraphQLError("Either login or provide email/phone number", {
                    extensions: { code: "BAD_USER_INPUT" },
                });
            }

            if (!user && input.email && !isValidEmail(input.email)) {
                throw new GraphQLError("Invalid email address", {
                    extensions: { code: "BAD_USER_INPUT" },
                });
            }

            if (!user && input.phone && !isValidPhone(input.phone)) {
                throw new GraphQLError("Invalid phone number", {
                    extensions: { code: "BAD_USER_INPUT" },
                });
            }

            // Simplified product check - only check if it exists, don't load variants
            const product = await prisma.product.findUnique({
                where: { id: input.productId },
                select: { id: true, name: true },
            });

            if (!product) {
                throw new GraphQLError("Product not found", {
                    extensions: { code: "NOT_FOUND" },
                });
            }

            // Only check variant if variantId is provided
            if (input.variantId) {
                const variant = await prisma.productVariant.findUnique({
                    where: { id: input.variantId },
                    select: { id: true },
                });

                if (!variant) {
                    throw new GraphQLError("Variant not found", {
                        extensions: { code: "NOT_FOUND" },
                    });
                }
            }

            // Duplicate check for both logged-in and guest users
            const existingNotification = await prisma.productNotification.findFirst({
                where: {
                    productId: input.productId,
                    variantId: input.variantId || null,
                    userId: user?.id || undefined,
                    email: !user ? input.email : undefined,
                    phone: !user ? input.phone : undefined,
                    isNotified: false,
                },
            });

            if (existingNotification) {
                return existingNotification;
            }

            // Create notification
            try {
                const notification = await prisma.productNotification.create({
                    data: {
                        productId: input.productId,
                        variantId: input.variantId || null,
                        userId: user?.id,
                        email: input.email || user?.email,
                        phone: input.phone || user?.phone,
                    },
                });

                return notification;
            } catch (error) {
                console.error("Error creating notification:", error);
                throw new GraphQLError("Failed to create notification", {
                    extensions: { code: "INTERNAL_SERVER_ERROR" },
                });
            }
        },

        cancelProductNotification: async (
            _: any,
            { productId, variantId }: { productId: string; variantId?: string },
            context: GraphQLContext
        ) => {
            const { prisma, user } = context;

            if (!user) {
                throw new GraphQLError("You must be logged in to cancel notifications", {
                    extensions: { code: "UNAUTHORIZED" },
                });
            }

            // Delete the notification
            const result = await prisma.productNotification.deleteMany({
                where: {
                    productId,
                    variantId: variantId || null,
                    userId: user.id,
                    isNotified: false,
                },
            });

            if (result.count === 0) {
                throw new GraphQLError("No active notification found", {
                    extensions: { code: "NOT_FOUND" },
                });
            }

            return {
                success: true,
                message: "Notification cancelled successfully",
            };
        },

        notifyProductRestock: async (
            _: any,
            { productId, variantId }: { productId: string; variantId?: string },
            context: GraphQLContext
        ) => {
            const { prisma, user } = context;

            // Check if user is seller of this product
            const product = await prisma.product.findUnique({
                where: { id: productId },
                include: {
                    variants: true,
                    seller: true,
                },
            });

            if (!product) {
                throw new GraphQLError("Product not found", {
                    extensions: { code: "NOT_FOUND" },
                });
            }

            if (!user || product.sellerId !== user.id) {
                throw new GraphQLError("Unauthorized - Only product seller can trigger notifications", {
                    extensions: { code: "UNAUTHORIZED" },
                });
            }

            // Get all pending notifications for this product/variant
            const notifications = await prisma.productNotification.findMany({
                where: {
                    productId,
                    variantId: variantId || null,
                    isNotified: false,
                },
                include: {
                    user: true,
                },
            });

            if (notifications.length === 0) {
                return {
                    success: true,
                    message: "No pending notifications found",
                    notifiedCount: 0,
                };
            }

            // Send notifications
            let notifiedCount = 0;
            const notificationIds: string[] = [];

            for (const notification of notifications) {
                try {
                    // Send email notification
                    const emailToUse = notification.email || notification.user?.email;
                    if (emailToUse) {
                        await sendEmailNotification(
                            emailToUse,
                            product.name,
                            product.slug
                        ).catch(err => console.error(`Email fail: ${err.message}`));
                    }

                    // Send WhatsApp notification
                    const phoneToUse = notification.phone || notification.user?.phone;
                    if (phoneToUse) {
                        await sendWhatsAppNotification(
                            phoneToUse,
                            product.name,
                            product.slug
                        ).catch(err => console.error(`WhatsApp fail: ${err.message}`));
                    }

                    notificationIds.push(notification.id);
                    notifiedCount++;
                } catch (error) {
                    console.error("Error sending notification:", error);
                    // Still mark as notified so we don't spam
                    notificationIds.push(notification.id);
                }
            }

            // Mark notifications as sent
            if (notificationIds.length > 0) {
                await prisma.productNotification.updateMany({
                    where: {
                        id: { in: notificationIds },
                    },
                    data: {
                        isNotified: true,
                    },
                });
            }

            return {
                success: true,
                message: `Successfully notified ${notifiedCount} users`,
                notifiedCount,
            };
        },
    },
};

// Helper functions
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
    // Basic phone validation - adjust based on your requirements
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ""));
}
