"use client";

import { useRealtime } from "@upstash/realtime/client";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function NotificationListener() {
    const { userId } = useAuth();
    const router = useRouter();

    const events = useMemo(
        () => ({
            message: {
                newMessage: (payload: any) => {
                    // If we are already on the chat page for this conversion, maybe don't toast?
                    // But we don't know the current URL easily here without checking pathname.
                    // For now, simple toast.

                    const senderName = payload.sender?.firstName || "Someone";

                    toast.message(`New message from ${senderName}`, {
                        description: payload.content || "Sent an attachment",
                        action: {
                            label: "View",
                            onClick: () => router.push(`/product/${payload.conversationId?.split("_")[0] || ""}`), // Todo: Link to chat? Buyer chat is usually on product page or separate?
                            // Actual Buyer Chat is on /product/[slug] or a modal?
                            // The chat is usually Contextual.
                            // We need to know where to link.
                            // Payload should ideally have product slug or we assume.
                        },
                    });
                },
            },
        }),
        [router]
    );

    // Wrap realtime in try-catch to prevent blocking
    useEffect(() => {
        try {
            const cleanup = (useRealtime as any)({
                channel: userId ? `user:${userId}` : undefined,
                events,
            });

            return () => {
                if (cleanup && typeof cleanup === 'function') {
                    cleanup();
                }
            };
        } catch (error) {
            console.error('[Notification] Realtime connection error:', error);
        }
    }, [userId, events]);

    return null;
}
