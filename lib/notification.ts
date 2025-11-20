// lib/notifications.ts
import { prisma } from "@/lib/db/prisma";
import { realtime } from "@/lib/realtime";

type NotificationType = "NEW_MESSAGE" | "NEW_ORDER" | "ORDER_STATUS" | "SYSTEM";

interface CreateNotificationInput {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
}

export async function createAndPushNotification({
  userId,
  title,
  body,
  type,
}: CreateNotificationInput) {
  // 1. Save to DB

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Invalid User");
  const clerkId = user.clerkId;

  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      body,
      type,
    },
  });

  if (!notification) throw new Error("unable to send notofication");

  // 2. Push via Upstash Realtime (private channel per user)

  console.log(`user:${clerkId}`);
  // console.log("REALTIME INSTANCE (publisher):", realtime)
  try {
    await realtime
      .channel(`user:${clerkId}`)
      .emit("notification.newNotification", {
        id: notification.id,
        title,
        body,
        type,
        createdAt: notification.createdAt.toISOString(),
        isRead: false,
      });
  } catch (error) {
    console.error("Failed to push realtime notification:", error);
  }

  return notification;
}

// try {
//     const sentNotificationRespone=await realtime
//       .channel(`user:${clerkId}`)
//       .emit("notification.newNotification", {
//         id: notification.id,
//         title,
//         body,
//         type,
//         data: data || null,
//         createdAt: notification.createdAt.toISOString(),
//         isRead: false,
//       });

//       console.log("sentNotificationRespone-->",sentNotificationRespone)
//   } catch (error) {
//     console.error("Failed to push realtime notification:", error);
//     // Don't throw — DB save already succeeded
//   }
