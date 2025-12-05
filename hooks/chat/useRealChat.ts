// hooks/chat/useRealChat.ts
"use client";

import { CREATE_CONVERSATION } from "@/client/conversatation/conversatatioln.mutatio";
import { GET_CONVERSATION_BY_PRODUCT } from "@/client/conversatation/conversatation.query";
import { SEND_MESSAGE } from "@/client/message/message.mutation";
import { GET_MESSAGES } from "@/client/message/message.query";
import { RealtimeEvents } from "@/lib/realtime";
// Import both LocalMessage and MessageType
import { LocalMessage, MessageType, MessageAttachment } from "@/types/chat";
import { uploadFilesToStorage } from "@/utlis/uploadFilesToStorage";
import { FetchPolicy, useLazyQuery, useMutation } from "@apollo/client";
import { useAuth } from "@clerk/nextjs";
import { useRealtime } from "@upstash/realtime/client";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const FETCH_POLICY_NO_CACHE: FetchPolicy = "no-cache";

type RealtimeNewMessage = z.infer<RealtimeEvents["message"]["newMessage"]>;

export const useRealChat = (productId?: string, currentUserId?: string) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const isInitializingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const lastProductIdRef = useRef<string | undefined>(productId);

  const [getConversation] = useLazyQuery(GET_CONVERSATION_BY_PRODUCT, {
    fetchPolicy: FETCH_POLICY_NO_CACHE,
  });
  const [fetchMessages] = useLazyQuery(GET_MESSAGES, {
    fetchPolicy: FETCH_POLICY_NO_CACHE,
  });
  const [createConversation] = useMutation(CREATE_CONVERSATION);
  const [sendMessageMutation] = useMutation(SEND_MESSAGE);

  useEffect(() => {
    if (lastProductIdRef.current !== productId) {
      lastProductIdRef.current = productId;
      setConversationId(null);
      setMessages([]);
      hasInitializedRef.current = false;
    }
  }, [productId]);

  const normalizeMessage = useCallback(
    (msg: any): LocalMessage => {
      let attachments: any[] = [];
      if (msg.attachments?.length) {
        attachments = msg.attachments.map((a: any) => ({
          id: a.id || crypto.randomUUID(),
          url: a.url || a.fileUrl,
          type: (a.type as MessageType) || "IMAGE",
        }));
      } else if (msg.fileUrl) {
        attachments = [
          {
            id: crypto.randomUUID(),
            url: msg.fileUrl,
            type: (msg.type as MessageType) || "IMAGE",
          },
        ];
      }

      // UPDATED CHECK:
      // 1. Check if msg.sender.clerkId matches (from Server)
      // 2. OR Check if msg.senderId matches (from Optimistic update)
      const isMe =
        (msg.sender?.clerkId && msg.sender.clerkId === currentUserId) ||
        msg.senderId === currentUserId;
      console.log("msg.sender?.clerkId", msg.sender?.clerkId);
      console.log("currentUserId", currentUserId);
      console.log("msg.senderId", msg.senderId);
      console.log("", currentUserId);

      console.log("is me-->", isMe);
      console.log("msg-->", msg);

      return {
        id: msg.id,
        clientId: msg.clientId,
        text: msg.content || "",
        sender: isMe ? "user" : "seller",
        senderId: msg.sender?.id || msg.senderId,
        timestamp: new Date(msg.sentAt || msg.createdAt || new Date()),
        status: "sent",
        attachments: attachments.length ? attachments : undefined,
      };
    },
    [currentUserId]
  );

  const upsertMessage = useCallback((incoming: LocalMessage) => {
    setMessages((prev) => {
      const existingClientIdx = incoming.clientId
        ? prev.findIndex((m) => m.clientId === incoming.clientId)
        : -1;

      const existingServerIdx = prev.findIndex((m) => m.id === incoming.id);

      let newMessages = [...prev];

      if (existingServerIdx !== -1) {
        newMessages[existingServerIdx] = {
          ...newMessages[existingServerIdx],
          ...incoming,
          status: "sent",
        };
      } else if (existingClientIdx !== -1) {
        newMessages[existingClientIdx] = { ...incoming, status: "sent" };
      } else {
        newMessages.push(incoming);
      }

      return newMessages.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );
    });
  }, []);

  const initializeChat = useCallback(async () => {
    if (
      !productId ||
      !currentUserId ||
      isInitializingRef.current ||
      hasInitializedRef.current
    )
      return;

    try {
      isInitializingRef.current = true;
      setIsLoading(true);
      setError(null);

      const { data: convData } = await getConversation({
        variables: { productId },
      });
      let convId = convData?.conversationByProduct?.id;

      if (!convId) {
        try {
          const { data: createData } = await createConversation({
            variables: { input: { productId } },
          });
          convId = createData?.createConversation?.id;
        } catch (err) {
          console.error("Creation failed", err);
        }
      }

      if (!convId) throw new Error("Could not start conversation");

      setConversationId(convId);
      hasInitializedRef.current = true;

      const { data: msgData } = await fetchMessages({
        variables: { conversationId: convId, limit: 50, offset: 0 },
      });

      if (msgData?.messages) {
        const normalized = msgData.messages.map(normalizeMessage);
        setMessages(
          normalized.sort(
            (a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime()
          )
        );
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to load chat");
      toast.error("Chat Error: " + (e.message || "Failed to load"));
    } finally {
      setIsLoading(false);
      isInitializingRef.current = false;
    }
  }, [
    productId,
    currentUserId,
    getConversation,
    createConversation,
    fetchMessages,
    normalizeMessage,
  ]);

  const handleSend = useCallback(
    async (text: string, files: File[] = []) => {
      if (!conversationId || (!text.trim() && !files.length)) return;

      const clientId = crypto.randomUUID();

      // Optimistic Update
      const optimisticAttachments: MessageAttachment[] = files.map((f) => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(f),
        type: f.type.startsWith("video") ? "VIDEO" : "IMAGE",
      }));

      const optimisticMsg: LocalMessage = {
        id: clientId,
        clientId,
        text: text.trim(),
        sender: "user",
        senderId: currentUserId,
        timestamp: new Date(),
        status: "sending",
        attachments: optimisticAttachments.length
          ? optimisticAttachments
          : undefined,
      };

      setMessages((prev) => [...prev, optimisticMsg]);

      try {
        // FIX 2: Explicitly type the uploaded variable
        let uploaded: { url: string; type: "IMAGE" | "VIDEO" }[] | undefined;

        if (files.length) {
          uploaded = await uploadFilesToStorage(files);
        }

        const type = uploaded?.some((u) => u.type === "VIDEO")
          ? "VIDEO"
          : uploaded?.length
            ? "IMAGE"
            : "TEXT";

        const { data } = await sendMessageMutation({
          variables: {
            input: {
              conversationId,
              content: text.trim() || undefined,
              type,
              clientId,
              attachments: uploaded,
            },
          },
        });

        if (data?.sendMessage) {
          const normalized = normalizeMessage(data.sendMessage);
          upsertMessage({ ...normalized, clientId });
        }

        optimisticAttachments.forEach((a) => URL.revokeObjectURL(a.url));
      } catch (e) {
        console.error(e);
        setMessages((prev) =>
          prev.map((m) =>
            m.clientId === clientId ? { ...m, status: "failed" } : m
          )
        );
        toast.error("Failed to send message");
      }
    },
    [
      conversationId,
      currentUserId,
      sendMessageMutation,
      normalizeMessage,
      upsertMessage,
    ]
  );

  const handleRealtimeMessage = useCallback(
    (payload: RealtimeNewMessage) => {
      if (!payload) return;
      const normalized = normalizeMessage(payload);
      upsertMessage(normalized);
    },
    [normalizeMessage, upsertMessage]
  );

  useRealtime<RealtimeEvents, "message.newMessage">({
    channels: conversationId ? [`conversation:${conversationId}`] : undefined,
    event: "message.newMessage",
    onData: handleRealtimeMessage,
    enabled: !!conversationId,
  });

  return {
    conversationId,
    messages,
    initializeChat,
    handleSend,
    isLoading,
    error,
  };
};
