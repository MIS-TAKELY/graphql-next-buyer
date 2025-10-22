// hooks/chat/useRealChat.ts
"use client";

import { CREATE_CONVERSATION } from "@/client/conversatation/conversatatioln.mutatio";
import { GET_CONVERSATION_BY_PRODUCT } from "@/client/conversatation/conversatation.query";
import { SEND_MESSAGE } from "@/client/message/message.mutation";
import { GET_MESSAGES } from "@/client/message/message.query";
import { RealtimeEvents } from "@/lib/realtime";
import { uploadFilesToStorage } from "@/utlis/uploadFilesToStorage";
// import { uploadFilesToStorage } from "@/utils/uploadFilesToStorage";

import {
  ApolloError,
  FetchPolicy,
  useLazyQuery,
  useMutation,
} from "@apollo/client";
import { useRealtime } from "@upstash/realtime/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface LocalMessage {
  id: string; // server id when known, otherwise temporary
  clientId?: string; // stable local id to link optimistic -> server
  text: string;
  sender: "user" | "seller";
  timestamp: Date;
  status?: "sending" | "sent" | "failed";
  attachments?: Array<{ id: string; url: string; type: "IMAGE" | "VIDEO" }>;
}

const FETCH_POLICY_NO_CACHE: FetchPolicy = "no-cache";

export const useRealChat = (productId?: string, userId?: string) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track the current conversation to reset state on product change
  const lastProductIdRef = useRef<string | undefined>(productId);

  // Normalize server message shape into LocalMessage
  const normalizeServerMessage = useCallback((msg: any): LocalMessage => {
    let attachments: Array<{ id: string; url: string; type: "IMAGE" | "VIDEO" }> = [];
    
    // Check for attachments array
    if (msg.attachments && Array.isArray(msg.attachments) && msg.attachments.length > 0) {
      attachments = msg.attachments.map((a: any) => ({
        id: a.id || crypto.randomUUID(),
        url: a.url || a.fileUrl,
        type: a.type as "IMAGE" | "VIDEO",
      }));
    } else if (msg.fileUrl) {
      attachments = [{
        id: msg.id || crypto.randomUUID(),
        url: msg.fileUrl,
        type: msg.type === "VIDEO" ? "VIDEO" : "IMAGE",
      }];
    }

    return {
      id: msg.id,
      clientId: msg.clientId ?? undefined,
      text: msg.content || "",
      sender: msg.sender?.role === "BUYER" ? "user" : "seller",
      timestamp: new Date(msg.sentAt),
      status: "sent",
      attachments: attachments.length > 0 ? attachments : undefined,
    };
  }, []);

  // Dedup helper: apply/merge a server message into state (query/mutation/realtime)
  const upsertServerMessage = useCallback((incoming: LocalMessage) => {
    setMessages((prev) => {
      // Helper to clean up blob URLs
      const cleanBlobs = (msg: LocalMessage) => {
        msg.attachments?.forEach((a) => {
          if (a.url.startsWith("blob:")) {
            URL.revokeObjectURL(a.url);
          }
        });
      };

      // 1) Replace by server id if we already have it
      const byServerId = prev.findIndex((m) => m.id === incoming.id);
      if (byServerId >= 0) {
        cleanBlobs(prev[byServerId]);
        const copy = prev.slice();
        const clientId = prev[byServerId].clientId ?? incoming.clientId;
        copy[byServerId] = { ...incoming, clientId, status: "sent" };
        return copy;
      }

      // 2) Replace by clientId if the server echoes it (best case)
      if (incoming.clientId) {
        const byClientId = prev.findIndex(
          (m) => m.clientId === incoming.clientId
        );
        if (byClientId >= 0) {
          cleanBlobs(prev[byClientId]);
          const copy = prev.slice();
          copy[byClientId] = {
            ...incoming,
            clientId: incoming.clientId,
            status: "sent",
          };
          return copy;
        }
      }

      // 3) Fallback: try to replace the latest "sending" user message with same text
      const candidateIndex = [...prev]
        .map((m, i) => ({ m, i }))
        .reverse()
        .find(
          ({ m }) =>
            m.status === "sending" &&
            m.sender === incoming.sender &&
            m.text === incoming.text
        )?.i;

      if (candidateIndex !== undefined) {
        cleanBlobs(prev[candidateIndex]);
        const copy = prev.slice();
        const keptClientId = copy[candidateIndex].clientId;
        copy[candidateIndex] = {
          ...incoming,
          clientId: keptClientId,
          status: "sent",
        };
        return copy;
      }

      // 4) Not found at all — append
      return [...prev, { ...incoming, status: "sent" }];
    });
  }, []);

  // Lazy query to check conversation existence
  const [getConversationByProduct] = useLazyQuery(GET_CONVERSATION_BY_PRODUCT, {
    fetchPolicy: FETCH_POLICY_NO_CACHE,
  });

  // Lazy query to fetch messages when we know the conversation id
  const [fetchMessages] = useLazyQuery(GET_MESSAGES, {
    fetchPolicy: FETCH_POLICY_NO_CACHE,
  });

  // Create conversation mutation
  const [createConversation] = useMutation(CREATE_CONVERSATION);

  // Send message mutation (we reconcile in handleSend rather than onCompleted to access clientId)
  const [sendMessageMutation] = useMutation(SEND_MESSAGE);

  // Reset chat when productId changes
  useEffect(() => {
    if (lastProductIdRef.current !== productId) {
      lastProductIdRef.current = productId;
      setConversationId(null);
      setMessages([]);
      setError(null);
      setIsLoading(false);
    }
  }, [productId]);

  const initializeChat = useCallback(async () => {
    if (!productId || !userId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Always check fresh on init to avoid races with initial queries
      const { data: convData } = await getConversationByProduct({
        variables: { productId },
      });

      let convId: string | null = convData?.conversationByProduct?.id ?? null;

      if (!convId) {
        const { data: created } = await createConversation({
          variables: { input: { productId } },
        });
        convId = created?.createConversation?.id ?? null;
      }

      if (!convId) {
        throw new Error("Unable to initialize conversation.");
      }

      setConversationId((prev) => {
        // If switching to a different conversation id, clear old messages
        if (prev && prev !== convId) setMessages([]);
        return convId!;
      });

      // Fetch latest messages (merge with any optimistic "sending" ones)
      const { data: messagesData } = await fetchMessages({
        variables: { conversationId: convId, limit: 50, offset: 0 },
      });

      if (messagesData?.messages) {
        const serverMsgs: LocalMessage[] = messagesData.messages
          .map(normalizeServerMessage)
          // sort ascending by time (optional)
          .sort((a: LocalMessage, b: LocalMessage) => a.timestamp.getTime() - b.timestamp.getTime());

        setMessages((prev) => {
          // Merge: keep any optimistic messages not yet acknowledged
          // and replace/add any that came from server
          let next = prev;
          for (const sm of serverMsgs) {
            // reuse the same upsert logic
            next = (() => {
              const byServer = next.findIndex((m) => m.id === sm.id);
              if (byServer >= 0) {
                const copy = next.slice();
                const clientId = next[byServer].clientId ?? sm.clientId;
                copy[byServer] = { ...sm, clientId, status: "sent" };
                return copy;
              }
              if (sm.clientId) {
                const byClientId = next.findIndex(
                  (m) => m.clientId === sm.clientId
                );
                if (byClientId >= 0) {
                  const copy = next.slice();
                  copy[byClientId] = {
                    ...sm,
                    clientId: sm.clientId,
                    status: "sent",
                  };
                  return copy;
                }
              }
              return [...next, sm];
            })();
          }
          // Final dedupe by server id then clientId to be safe
          const seenServer = new Set<string>();
          const seenClient = new Set<string>();
          const deduped: LocalMessage[] = [];
          for (const m of next) {
            if (m.id && seenServer.has(m.id)) continue;
            if (m.clientId && seenClient.has(m.clientId)) continue;
            if (m.id) seenServer.add(m.id);
            if (m.clientId) seenClient.add(m.clientId);
            deduped.push(m);
          }
          return deduped;
        });
      }
    } catch (e) {
      const msg =
        e instanceof ApolloError
          ? e.message
          : (e as Error)?.message || "Failed to initialize chat";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [
    productId,
    userId,
    getConversationByProduct,
    createConversation,
    fetchMessages,
    normalizeServerMessage,
  ]);

  const handleSend = useCallback(
    async (text: string, files?: File[]) => {
      if (!conversationId || (!text.trim() && !files?.length)) return;

      const clientId = crypto.randomUUID();
      
      // Create optimistic attachments with blob URLs for preview
      const optimisticAttachments = files?.map((file) => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        type: file.type.includes("video") ? ("VIDEO" as const) : ("IMAGE" as const),
      })) ?? [];

      const optimistic: LocalMessage = {
        id: clientId, // temporary id for React keying
        clientId,
        text: text.trim(),
        sender: "user",
        timestamp: new Date(),
        status: "sending",
        attachments: optimisticAttachments.length > 0 ? optimisticAttachments : undefined,
      };

      setMessages((prev) => [...prev, optimistic]);
      setError(null);

      try {
        let uploadedAttachments: Array<{ url: string; type: "IMAGE" | "VIDEO" }> | undefined;

        if (files?.length) {
          // Check file sizes
          const tooBig = files.find((f) => f.size > 10 * 1024 * 1024);
          if (tooBig) {
            throw new Error(`"${tooBig.name}" exceeds the 10MB limit`);
          }

          uploadedAttachments = await uploadFilesToStorage(files);
        }

        // Determine message type based on attachments
        const msgType: "TEXT" | "IMAGE" | "VIDEO" = uploadedAttachments?.some(
          (a) => a.type === "VIDEO"
        )
          ? "VIDEO"
          : uploadedAttachments?.length
          ? "IMAGE"
          : "TEXT";

        const { data } = await sendMessageMutation({
          variables: {
            input: {
              conversationId,
              content: text.trim() || undefined,
              type: msgType,
              attachments: uploadedAttachments,
              clientId,
            },
          },
        });

        const serverMsg = data?.sendMessage;
        if (!serverMsg) return;

        // If server didn't return attachments but we sent them, add them manually
        if (uploadedAttachments && (!serverMsg.attachments || serverMsg.attachments.length === 0)) {
          serverMsg.attachments = uploadedAttachments;
        }

        const normalized = normalizeServerMessage(serverMsg);
        // Ensure the client's id is preserved if the server didn't echo it
        if (!normalized.clientId) normalized.clientId = clientId;
        
        // If normalized didn't get attachments but we uploaded them, add them
        if (uploadedAttachments && !normalized.attachments) {
          normalized.attachments = uploadedAttachments.map(a => ({
            id: crypto.randomUUID(),
            url: a.url,
            type: a.type,
          }));
        }
        
        upsertServerMessage(normalized);

        // Clean up optimistic blob URLs after successful send
        optimisticAttachments.forEach(a => {
          if (a.url.startsWith("blob:")) {
            URL.revokeObjectURL(a.url);
          }
        });
      } catch (e: any) {
        const msg =
          e instanceof ApolloError
            ? e.message
            : e?.message || "Failed to send message";
        setError(msg);
        setMessages((prev) =>
          prev.map((m) =>
            m.clientId === clientId ? { ...m, status: "failed" } : m
          )
        );
      }
    },
    [
      conversationId,
      sendMessageMutation,
      normalizeServerMessage,
      upsertServerMessage,
    ]
  );

  // Realtime subscription — guard against duplicates by id and reconcile optimistic by clientId if echoed
  const handleRealtimeNewMessage = useCallback(
    (payload: RealtimeEvents["message"]["newMessage"]) => {
      if (!payload) return;
      const normalized = normalizeServerMessage(payload);

      // If the message is from the current user and we have an optimistic one, this will replace it.
      // If it's from the other party, it'll append unless it's already present.
      upsertServerMessage(normalized);
    },
    [normalizeServerMessage, upsertServerMessage]
  );

  const events = useMemo(
    () => ({
      message: {
        newMessage: handleRealtimeNewMessage,
      },
    }),
    [handleRealtimeNewMessage]
  );

  useRealtime<RealtimeEvents>({
    channel: conversationId ? `conversation:${conversationId}` : undefined,
    events,
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