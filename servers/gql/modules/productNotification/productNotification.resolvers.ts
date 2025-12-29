import { GraphQLError } from "graphql";
import { GraphQLContext } from "../../context";
import nodemailer from "nodemailer";

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

            // Simplified duplicate check - only check for logged-in user
            if (user) {
                const existingNotification = await prisma.productNotification.findFirst({
                    where: {
                        productId: input.productId,
                        variantId: input.variantId || null,
                        userId: user.id,
                        isNotified: false,
                    },
                });

                if (existingNotification) {
                    return existingNotification;
                }
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
                    if (notification.email || notification.user?.email) {
                        await sendEmailNotification(
                            notification.email || notification.user!.email,
                            product.name,
                            product.slug
                        );
                    }

                    // Send WhatsApp notification (placeholder - implement with your WhatsApp service)
                    if (notification.phone || notification.user?.phone) {
                        await sendWhatsAppNotification(
                            notification.phone || notification.user!.phone!,
                            product.name,
                            product.slug
                        );
                    }

                    notificationIds.push(notification.id);
                    notifiedCount++;
                } catch (error) {
                    console.error("Error sending notification:", error);
                }
            }

            // Mark notifications as sent
            await prisma.productNotification.updateMany({
                where: {
                    id: { in: notificationIds },
                },
                data: {
                    isNotified: true,
                },
            });

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

async function sendEmailNotification(
    email: string,
    productName: string,
    productSlug: string
): Promise<void> {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const productUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://vanijay.com"}/product/${productSlug}`;

    await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: `${productName} is back in stock!`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Good News!</h2>
        <p>The product you were waiting for is now back in stock:</p>
        <h3 style="color: #333;">${productName}</h3>
        <p>Don't miss out - grab it before it's gone again!</p>
        <a href="${productUrl}" style="display: inline-block; padding: 12px 24px; background-color: #f97316; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          View Product
        </a>
        <p style="margin-top: 24px; color: #666; font-size: 14px;">
          This is an automated notification. You requested to be notified when this product becomes available.
        </p>
      </div>
    `,
    });
}

async function sendWhatsAppNotification(
    phone: string,
    productName: string,
    productSlug: string
): Promise<void> {
    // Placeholder for WhatsApp notification
    // Implement this with your WhatsApp Business API or service like Twilio
    const productUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://vanijay.com"}/product/${productSlug}`;

    console.log(`WhatsApp notification to ${phone}: ${productName} is back in stock! ${productUrl}`);

    // Example with Twilio (uncomment and configure):
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);
  
    await client.messages.create({
      body: `Good news! ${productName} is back in stock. Check it out: ${productUrl}`,
      from: 'whatsapp:+14155238886', // Twilio WhatsApp number
      to: `whatsapp:${phone}`
    });
    */
}
