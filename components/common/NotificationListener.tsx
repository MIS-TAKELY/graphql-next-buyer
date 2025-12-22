"use client";

import { useRealtime } from "@upstash/realtime/client";
import { useSession } from "@/lib/auth-client";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function NotificationListener() {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const router = useRouter();

    // Correctly call the hook at the top level
    useRealtime({
        channels: userId ? [`user:${userId}`] : [],
        event: "message.newMessage",
        onData: (payload: any) => {
            const senderName = payload.sender?.firstName || "Someone";

            toast.message(`New message from ${senderName}`, {
                description: payload.content || "Sent an attachment",
                action: {
                    label: "View",
                    onClick: () =>
                        router.push(
                            `/product/${payload.conversationId?.split("_")[0] || ""}`
                        ),
                },
            });
        },
    });

    return null;
}
