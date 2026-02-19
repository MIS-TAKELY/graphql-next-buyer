import { prisma } from "@/lib/db/prisma";
import { senMail } from "@/services/nodeMailer.services";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { createAndPushNotification } from "@/lib/notification";
import { realtime } from "@/lib/realtime";

interface BuyerInfo {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
}

interface SellerInfo {
  id: string;
  email: string;
  phoneNumber?: string | null;
}

interface NotificationPrefs {
  email: boolean;
  whatsapp: boolean;
  inApp: boolean;
}

function safeAsync(fn: () => Promise<unknown>, label: string) {
  fn().catch((err) => console.error(`[Notification] ${label} failed:`, err.message));
}

async function getUserNotificationPrefs(userId: string): Promise<NotificationPrefs> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailNotifications: true, whatsappNotifications: true, inAppNotifications: true },
    });
    return {
      email: user?.emailNotifications ?? true,
      whatsapp: user?.whatsappNotifications ?? true,
      inApp: user?.inAppNotifications ?? true,
    };
  } catch {
    return { email: true, whatsapp: true, inApp: true };
  }
}

function sendWithPrefs(
  userId: string,
  channels: {
    email?: () => Promise<unknown>;
    whatsapp?: () => Promise<unknown>;
    inApp?: () => Promise<unknown>;
    realtime?: () => Promise<unknown>;
  },
  label: string
) {
  getUserNotificationPrefs(userId)
    .then((prefs) => {
      if (prefs.email && channels.email) safeAsync(channels.email, `${label} email`);
      if (prefs.whatsapp && channels.whatsapp) safeAsync(channels.whatsapp, `${label} WhatsApp`);
      if (prefs.inApp && channels.inApp) safeAsync(channels.inApp, `${label} in-app`);
      if (channels.realtime) safeAsync(channels.realtime, `${label} realtime`);
    })
    .catch((err) => console.error(`[Notification] ${label} prefs fetch failed:`, err.message));
}

export function notifyBuyerOrderCreated(
  buyer: BuyerInfo,
  orderNumber: string,
  total: string,
  paymentProvider: string
) {
  const buyerName = buyer.firstName || "there";

  sendWithPrefs(
    buyer.id,
    {
      email: () =>
        senMail(buyer.email, "ORDER_CONFIRMED_BUYER", {
          name: buyerName,
          orderNumber,
          total,
          paymentProvider,
        }),
      whatsapp: buyer.phoneNumber
        ? () =>
          sendWhatsAppMessage(
            buyer.phoneNumber!,
            `✅ Order Placed Successfully!\nOrder #${orderNumber}\nTotal: रु${total}\nPayment: ${paymentProvider}\n\nThank you for shopping on Vanijay!`
          )
        : undefined,
      inApp: () =>
        createAndPushNotification({
          userId: buyer.id,
          title: "Order Placed Successfully!",
          body: `Your order #${orderNumber} for NPR ${total} has been placed.`,
          type: "NEW_ORDER",
        }),
    },
    `Buyer order #${orderNumber}`
  );
}

export function notifySellerNewOrder(
  seller: SellerInfo,
  orderNumber: string,
  total: string,
  customerName: string,
  customerPhone: string,
  sellerOrderId: string,
  buyerOrderId: string
) {
  sendWithPrefs(
    seller.id,
    {
      email: () =>
        senMail(seller.email, "NEW_ORDER", {
          total,
          name: "Seller",
        }),
      whatsapp: seller.phoneNumber
        ? () =>
          sendWhatsAppMessage(
            seller.phoneNumber!,
            `🛒 New Order Received!\nOrder #${orderNumber}\nTotal: रु${total}\nCustomer: ${customerName}\nPhone: ${customerPhone}`
          )
        : undefined,
      inApp: () =>
        createAndPushNotification({
          userId: seller.id,
          title: "New Order Received!",
          body: `Order #${orderNumber} - NPR ${total} from ${customerName}`,
          type: "NEW_ORDER",
        }),
      realtime: () =>
        realtime.channel(`user:${seller.id}`).emit("order.newOrder", {
          sellerId: seller.id,
          sellerOrderId,
          buyerOrderId,
          status: "PENDING" as const,
          total: parseFloat(total),
          createdAt: new Date().toISOString(),
          customerName,
        }),
    },
    `Seller order #${orderNumber}`
  );
}

export function notifyPaymentSuccess(
  buyer: BuyerInfo,
  orderNumber: string,
  amount: string,
  provider: string
) {
  const buyerName = buyer.firstName || "there";

  sendWithPrefs(
    buyer.id,
    {
      email: () =>
        senMail(buyer.email, "PAYMENT_SUCCESS", {
          name: buyerName,
          orderNumber,
          amount,
          provider,
        }),
      whatsapp: buyer.phoneNumber
        ? () =>
          sendWhatsAppMessage(
            buyer.phoneNumber!,
            `✅ Payment Successful!\nOrder #${orderNumber}\nAmount: रु${amount}\nVia: ${provider}\n\nYour order is being processed.`
          )
        : undefined,
      inApp: () =>
        createAndPushNotification({
          userId: buyer.id,
          title: "Payment Successful!",
          body: `Payment of NPR ${amount} for order #${orderNumber} confirmed via ${provider}.`,
          type: "ORDER_STATUS",
        }),
    },
    `Payment success #${orderNumber}`
  );
}

export function notifyBuyerStatusChange(
  buyer: BuyerInfo,
  orderNumber: string,
  newStatus: string,
  previousStatus: string,
  sellerOrderId: string,
  buyerOrderId: string,
  total: string,
  extra?: { trackingNumber?: string; carrier?: string; cancellationReason?: string }
) {
  const buyerName = buyer.firstName || "there";
  const statusLabels: Record<string, string> = {
    CONFIRMED: "Confirmed",
    PROCESSING: "Being Processed",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    RETURNED: "Returned",
  };
  const label = statusLabels[newStatus] || newStatus;

  let emailFn: (() => Promise<unknown>) | undefined;
  let whatsappFn: (() => Promise<unknown>) | undefined;

  if (newStatus === "CONFIRMED") {
    emailFn = () =>
      senMail(buyer.email, "ORDER_CONFIRMED_STATUS", {
        name: buyerName,
        orderNumber,
      });
    if (buyer.phoneNumber) {
      whatsappFn = () =>
        sendWhatsAppMessage(
          buyer.phoneNumber!,
          `✅ Order Confirmed!\nOrder #${orderNumber} has been confirmed by the seller and is being prepared.\n\nTrack at: https://www.vanijay.com/account/orders`
        );
    }
  } else if (newStatus === "PROCESSING") {
    emailFn = () =>
      senMail(buyer.email, "ORDER_PROCESSING", {
        name: buyerName,
        orderNumber,
      });
    if (buyer.phoneNumber) {
      whatsappFn = () =>
        sendWhatsAppMessage(
          buyer.phoneNumber!,
          `⚙️ Order Processing\nOrder #${orderNumber} is now being processed and packed.\n\nTrack at: https://www.vanijay.com/account/orders`
        );
    }
  } else if (newStatus === "SHIPPED") {
    emailFn = () =>
      senMail(buyer.email, "ORDER_SHIPPED", {
        name: buyerName,
        orderNumber,
        trackingNumber: extra?.trackingNumber,
        carrier: extra?.carrier,
      });
    if (buyer.phoneNumber) {
      whatsappFn = () =>
        sendWhatsAppMessage(
          buyer.phoneNumber!,
          `📦 Order Shipped!\nOrder #${orderNumber} is on its way.${extra?.trackingNumber ? `\nTracking: ${extra.trackingNumber}` : ""}\n\nTrack at: https://www.vanijay.com/account/orders`
        );
    }
  } else if (newStatus === "DELIVERED") {
    emailFn = () =>
      senMail(buyer.email, "ORDER_DELIVERED", {
        name: buyerName,
        orderNumber,
      });
    if (buyer.phoneNumber) {
      whatsappFn = () =>
        sendWhatsAppMessage(
          buyer.phoneNumber!,
          `🎉 Order Delivered!\nOrder #${orderNumber} has been delivered.\nWe hope you enjoy your purchase!`
        );
    }
  } else if (newStatus === "CANCELLED") {
    emailFn = () =>
      senMail(buyer.email, "ORDER_CANCELLED", {
        name: buyerName,
        orderNumber,
        reason: extra?.cancellationReason,
        refundNote: "If you paid online, your refund will be processed within 5-7 business days.",
      });
    if (buyer.phoneNumber) {
      whatsappFn = () =>
        sendWhatsAppMessage(
          buyer.phoneNumber!,
          `❌ Order Cancelled\nOrder #${orderNumber} has been cancelled.${extra?.cancellationReason ? `\nReason: ${extra.cancellationReason}` : ""}\n\nIf you paid online, your refund will be processed within 5-7 business days.`
        );
    }
  }

  sendWithPrefs(
    buyer.id,
    {
      email: emailFn,
      whatsapp: whatsappFn,
      inApp: () =>
        createAndPushNotification({
          userId: buyer.id,
          title: `Order ${label}`,
          body: `Your order #${orderNumber} is now ${label}.`,
          type: "ORDER_STATUS",
        }),
      realtime: () =>
        realtime.channel(`user:${buyer.id}`).emit("order.statusChanged", {
          sellerId: "",
          sellerOrderId,
          buyerOrderId,
          status: newStatus as "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED",
          previousStatus: previousStatus as "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED",
          total: parseFloat(total),
          updatedAt: new Date().toISOString(),
        }),
    },
    `Status change #${orderNumber} → ${newStatus}`
  );
}

export function notifyOrderCancelled(
  buyer: BuyerInfo,
  orderNumber: string,
  reason: string,
  hasRefund: boolean
) {
  const buyerName = buyer.firstName || "there";

  sendWithPrefs(
    buyer.id,
    {
      email: () =>
        senMail(buyer.email, "ORDER_CANCELLED", {
          name: buyerName,
          orderNumber,
          reason,
          refundNote: hasRefund ? "Your refund will be processed within 5-7 business days." : undefined,
        }),
      whatsapp: buyer.phoneNumber
        ? () =>
          sendWhatsAppMessage(
            buyer.phoneNumber!,
            `❌ Order Cancelled\nOrder #${orderNumber} has been cancelled.\nReason: ${reason}${hasRefund ? "\nYour refund will be processed within 5-7 business days." : ""}`
          )
        : undefined,
      inApp: () =>
        createAndPushNotification({
          userId: buyer.id,
          title: "Order Cancelled",
          body: `Order #${orderNumber} has been cancelled. ${reason}`,
          type: "ORDER_STATUS",
        }),
    },
    `Cancel #${orderNumber}`
  );
}

export function notifyReturnUpdate(
  buyer: BuyerInfo,
  orderNumber: string,
  status: string,
  rejectionReason?: string
) {
  const buyerName = buyer.firstName || "there";

  sendWithPrefs(
    buyer.id,
    {
      email: () =>
        senMail(buyer.email, "RETURN_UPDATE", {
          name: buyerName,
          orderNumber,
          status,
          rejectionReason,
        }),
      whatsapp: buyer.phoneNumber
        ? () =>
          sendWhatsAppMessage(
            buyer.phoneNumber!,
            `🔄 Return Update\nOrder #${orderNumber}\nStatus: ${status}${rejectionReason ? `\nReason: ${rejectionReason}` : ""}\n\nView details at: https://www.vanijay.com/account/orders`
          )
        : undefined,
      inApp: () =>
        createAndPushNotification({
          userId: buyer.id,
          title: "Return Request Updated",
          body: `Return for order #${orderNumber}: ${status}`,
          type: "ORDER_STATUS",
        }),
    },
    `Return update #${orderNumber}`
  );
}

export function notifyBuyerDisputeSubmitted(
  buyer: BuyerInfo,
  orderNumber: string,
  disputeType: "CANCEL" | "RETURN",
  reason: string
) {
  const buyerName = buyer.firstName || "there";
  const typeLabel = disputeType === "CANCEL" ? "Cancellation" : "Return";

  sendWithPrefs(
    buyer.id,
    {
      email: () =>
        senMail(buyer.email, "DISPUTE_SUBMITTED_BUYER", {
          name: buyerName,
          orderNumber,
          disputeType,
          reason,
        }),
      whatsapp: buyer.phoneNumber
        ? () =>
          sendWhatsAppMessage(
            buyer.phoneNumber!,
            `📋 ${typeLabel} Request Submitted\nOrder #${orderNumber}\nReason: ${reason}\n\nThe seller will review your request and respond shortly.`
          )
        : undefined,
      inApp: () =>
        createAndPushNotification({
          userId: buyer.id,
          title: `${typeLabel} Request Submitted`,
          body: `Your ${typeLabel.toLowerCase()} request for order #${orderNumber} has been submitted.`,
          type: "ORDER_STATUS",
        }),
    },
    `Dispute submitted buyer #${orderNumber}`
  );
}

export function notifySellerDisputeReceived(
  seller: SellerInfo,
  orderNumber: string,
  disputeType: "CANCEL" | "RETURN",
  reason: string,
  customerName: string
) {
  const typeLabel = disputeType === "CANCEL" ? "Cancellation" : "Return";

  sendWithPrefs(
    seller.id,
    {
      email: () =>
        senMail(seller.email, "DISPUTE_SUBMITTED_SELLER", {
          name: "Seller",
          orderNumber,
          disputeType,
          reason,
          customerName,
        }),
      whatsapp: seller.phoneNumber
        ? () =>
          sendWhatsAppMessage(
            seller.phoneNumber!,
            `⚠️ New ${typeLabel} Request\nOrder #${orderNumber}\nCustomer: ${customerName}\nReason: ${reason}\n\nPlease review in your dashboard: https://seller.vanijay.com/orders`
          )
        : undefined,
      inApp: () =>
        createAndPushNotification({
          userId: seller.id,
          title: `New ${typeLabel} Request`,
          body: `${customerName} requested ${typeLabel.toLowerCase()} for order #${orderNumber}.`,
          type: "ORDER_STATUS",
        }),
    },
    `Dispute received seller #${orderNumber}`
  );
}
