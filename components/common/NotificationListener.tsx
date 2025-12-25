"use client";

import { useRealtime } from "@upstash/realtime/client";
import { useSession } from "@/lib/auth-client";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useNotificationStore } from "@/store/notificationStore";
import { useApolloClient } from "@apollo/client";
import { GET_ALL_CONVERSATIONS } from "@/client/conversatation/conversatation.query";

export function NotificationListener() {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const router = useRouter();
    const { setHasNewOrderUpdate } = useNotificationStore();
    const client = useApolloClient();

    // Correctly call the hook at the top level
    useRealtime({
        channels: userId ? [`user:${userId}`] : [],
        event: "message.newMessage",
        onData: (payload: any) => {
            const sentAt = new Date(payload.sentAt || payload.createdAt || Date.now());
            const now = Date.now();

            // Only show toast for messages sent in the last 60 seconds to avoid spam on reload
            const diff = now - sentAt.getTime();
            if (isNaN(diff) || diff > 60000) {
                console.log("[NotificationListener] Skipping toast for old/invalid message:", payload.id, "diff:", diff);
                return;
            }

            const senderName = payload.sender?.firstName || "Someone";

            // Trigger refetch of conversations to update unread count
            client.refetchQueries({ include: [GET_ALL_CONVERSATIONS] });

            toast.message(`New message from ${senderName}`, {
                description: payload.content || "Sent an attachment",
                action: {
                    label: "View",
                    onClick: () =>
                        router.push(
                            `/account/chat?conversation=${payload.conversationId || ""}`
                        ),
                },
            });
        },
    });

    useRealtime({
        channels: userId ? [`user:${userId}`] : [],
        event: "order.orderUpdated",
        onData: (payload: any) => {
            console.log("[NotificationListener] Order updated:", payload);
            setHasNewOrderUpdate(true);

            toast.message("Order Updated", {
                description: `Your order #${payload.orderNumber || payload.id || ""} has been updated to ${payload.status}.`,
                action: {
                    label: "View Orders",
                    onClick: () => router.push("/account/orders"),
                },
            });
        },
    });

    return null;
}
