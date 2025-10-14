"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RealtimeEvents } from "@/lib/realtime";
import { cn } from "@/lib/utils";
import { gql, useMutation, useQuery } from "@apollo/client"; // Assuming Apollo Client setup
import { useAuth } from "@clerk/nextjs";
import { useRealtime } from "@upstash/realtime/client";
// Import the RealtimeEvents type from your server-side realtime config
// e.g., import type { RealtimeEvents } from "@/lib/realtime";

import {
  Check,
  Heart,
  Loader2,
  MessageCircleMore,
  Send,
  Share2,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// GraphQL Queries/Mutations (define these in a separate file or inline)
const CREATE_CONVERSATION = gql`
  mutation CreateConversation($input: CreateConversationInput!) {
    createConversation(input: $input) {
      id
      title
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      content
      type
      fileUrl
      isRead
      sentAt
      sender {
        id
        firstName
        lastName
        email
        role
      }
    }
  }
`;

export const GET_MESSAGES = gql`
  query GetMessages($conversationId: ID!) {
    messages(conversationId: $conversationId) {
      id
      content
      type
      fileUrl
      isRead
      sentAt
      sender {
        id
        firstName
        lastName
        role
      }
    }
  }
`;

// Assuming you have a query for conversations by product/user
export const GET_CONVERSATION_BY_PRODUCT = gql`
  query GetConversationByProduct($productId: ID!) {
    conversationByProduct(productId: $productId) {
      id
      title
      product {
        id
        name
        slug
      }
      sender {
        id
        firstName
        lastName
      }
      reciever {
        id
        firstName
        lastName
      }
      messages {
        id
        content
        type
        sentAt
        sender {
          id
          firstName
          lastName
          role
        }
      }
    }
  }
`;

interface WishlistShareButtonsProps {
  addedToWishlist: boolean;
  toggleWishlist: () => void;
  itemName?: string;
  itemId?: string; // This is productId
}

interface LocalMessage {
  id: string;
  text: string;
  sender: "user" | "seller"; // Adapt: 'user' for buyer, 'seller' for seller
  timestamp: Date;
  status?: "sending" | "sent" | "failed";
  attachments?: Array<{ id: string; url: string; type: "IMAGE" | "VIDEO" }>;
}

// Custom hook for real chat functionality
const useRealChat = (productId?: string, userId?: string) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("productid--->", productId);

  const { data: existingConvData, error: getconvoError } = useQuery(
    GET_CONVERSATION_BY_PRODUCT,
    {
      variables: { productId },
      skip: !productId,
    }
  );
  if (getconvoError) console.log("getconvoError-->", getconvoError);

  console.log("GET_CONVERSATION_BY_PRODUCT-->", existingConvData);

  const [createConversation] = useMutation(CREATE_CONVERSATION, {
    onCompleted: (data) => {
      setConversationId(data.createConversation.id);
      setError(null);
    },
    onError: (err) => setError(err.message),
  });

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onCompleted: (data) => {
      // Append the sent message locally (optimistic update already done)
      const newMsg = data.sendMessage;
      setMessages((prev) => [
        ...prev,
        {
          id: newMsg.id,
          text: newMsg.content || "", // Assume text for now; handle attachments separately
          sender: newMsg.sender.role === "BUYER" ? "user" : "seller",
          timestamp: new Date(newMsg.sentAt),
          status: "sent",
          attachments: newMsg.attachments || [],
        },
      ]);
    },
    onError: (err) => {
      setError(err.message);
      // Revert optimistic update if needed
    },
  });

  const { data: messagesData, error: messageError } = useQuery(GET_MESSAGES, {
    variables: { conversationId, take: 50, skip: 0 },
    skip: !conversationId,
    onCompleted: (data) => {
      setMessages(
        data.messages.map((msg: any) => ({
          id: msg.id,
          text: msg.content || "",
          sender: msg.sender.role === "BUYER" ? "user" : "seller",
          timestamp: new Date(msg.sentAt),
          status: "sent",
          attachments: msg.attachments || [],
        }))
      );
    },
  });

  if (messageError) console.log("messageError--->", messageError);

  console.log("messages-->", messagesData);

  const initializeChat = useCallback(async () => {
    if (!productId || !userId) return;

    setIsLoading(true);
    try {
      // Check existing
      if (existingConvData?.conversationByProduct) {
        setConversationId(existingConvData.conversationByProduct.id);
        return;
      }

      // Create new
      await createConversation({
        variables: { input: { productId } },
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [productId, userId, existingConvData, createConversation]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!conversationId || !text.trim()) return;

      const optimisticMsg: LocalMessage = {
        id: crypto.randomUUID(), // Temp ID; real ID from mutation
        text: text.trim(),
        sender: "user",
        timestamp: new Date(),
        status: "sending",
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      setError(null);

      try {
        await sendMessage({
          variables: {
            input: {
              conversationId,
              content: text.trim(),
              type: "TEXT",
            },
          },
        });
        // Status updated in onCompleted
      } catch (err: any) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticMsg.id ? { ...m, status: "failed" } : m
          )
        );
        setError(err.message);
      }
    },
    [conversationId, sendMessage]
  );

  // In useRealChat hook, fix the event handler:
  useRealtime<RealtimeEvents>({
    channel: conversationId ? `conversation:${conversationId}` : undefined,
    events: {
      message: {
        newMessage: (payload) => {
          // Log the entire payload to debug
          console.log("Raw payload received:", payload);

          // Prevent duplicate messages
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === payload.id);
            if (exists) return prev;

            return [
              ...prev,
              {
                id: payload.id,
                text: payload.content || "",
                sender: payload.sender.role === "SELLER" ? "seller" : "user",
                timestamp: new Date(payload.sentAt),
                status: "sent" as const,
                attachments: payload.attachments || [],
              },
            ];
          });
        },
      },
    },
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

// Memoized message renderer (updated for real messages)
const MessageBubble = React.memo(({ message }: { message: LocalMessage }) => (
  <div
    className={cn(
      "flex gap-2",
      message.sender === "user" ? "justify-end" : "justify-start"
    )}
  >
    {message.sender === "seller" && (
      <Avatar className="w-7 h-7 sm:w-8 sm:h-8 shrink-0">
        <AvatarFallback className="text-xs">Seller</AvatarFallback>
      </Avatar>
    )}
    <div
      className={cn(
        "max-w-[75%] sm:max-w-[70%] px-3 py-2 rounded-2xl break-words",
        message.sender === "user"
          ? "bg-primary text-primary-foreground rounded-br-sm"
          : "bg-muted rounded-bl-sm"
      )}
    >
      <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
      {message.attachments!?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {message?.attachments!.map((att) => (
            <img
              key={att.id}
              src={att.url}
              alt=""
              className="w-16 h-16 rounded object-cover"
            />
          ))}
        </div>
      )}
      <p
        className={cn(
          "text-[10px] sm:text-xs mt-1",
          message.sender === "user"
            ? "text-primary-foreground/70"
            : "text-muted-foreground"
        )}
      >
        {message.timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
        {message.status === "sending" && " • Sending..."}
        {message.status === "failed" && " • Failed"}
      </p>
    </div>
    {message.sender === "user" && (
      <Avatar className="w-7 h-7 sm:w-8 sm:h-8 shrink-0">
        <AvatarFallback className="text-xs">You</AvatarFallback>
      </Avatar>
    )}
  </div>
));

MessageBubble.displayName = "MessageBubble";

export default function WishlistShareButtons({
  addedToWishlist,
  toggleWishlist,
  itemName,
  itemId,
}: WishlistShareButtonsProps) {
  const { userId, isLoaded } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  console.log("item id-->", itemId);

  const {
    conversationId,
    messages,
    initializeChat,
    handleSend,
    isLoading,
    error,
  } = useRealChat(itemId, userId || undefined);

  console.log("chat---->", isLoading, messages);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (showChat && inputRef.current) {
      const focusTimeout = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(focusTimeout);
    }
  }, [showChat]);

  const handleWishlistClick = useCallback(async () => {
    setIsAddingToWishlist(true);
    try {
      await toggleWishlist();
    } finally {
      setIsAddingToWishlist(false);
    }
  }, [toggleWishlist]);

  const handleShare = useCallback(async () => {
    try {
      const url = window.location.href;

      if (navigator.share && /mobile/i.test(navigator.userAgent)) {
        await navigator.share({
          title: itemName || "Check out this item",
          url: url,
        });
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [itemName]);

  const handleOpenChat = useCallback(async () => {
    if (!isLoaded || !userId) return;
    setShowChat(true);
    await initializeChat();
  }, [isLoaded, userId, initializeChat]);

  const handleSendMessage = useCallback(() => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue) {
      handleSend(trimmedValue);
      setInputValue("");
    }
  }, [inputValue, handleSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const shareButtonContent = useMemo(() => {
    if (copied) {
      return (
        <>
          <Check className="w-5 h-5 text-green-500" />
          <span className="ml-2 text-sm">Copied!</span>
        </>
      );
    }
    return <Share2 className="w-5 h-5" />;
  }, [copied]);

  const messageCount = useMemo(() => messages.length, [messages]);

  if (error) console.log("error--->", error);

  return (
    <TooltipProvider>
      <div className="flex gap-2">
        {/* Wishlist Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              variant="outline"
              onClick={handleWishlistClick}
              disabled={isAddingToWishlist}
              className={cn(
                "transition-all",
                addedToWishlist && "text-red-500 border-red-500 hover:bg-red-50"
              )}
              aria-label={
                addedToWishlist ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              {isAddingToWishlist ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Heart
                  className={cn(
                    "w-5 h-5 transition-all",
                    addedToWishlist && "fill-current"
                  )}
                />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {addedToWishlist ? "Remove from wishlist" : "Add to wishlist"}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Share Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              variant="outline"
              onClick={handleShare}
              className="transition-all"
              aria-label="Share this item"
            >
              {shareButtonContent}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share this item</p>
          </TooltipContent>
        </Tooltip>

        {/* Message Button */}
        {isLoaded && userId && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                variant="outline"
                onClick={handleOpenChat}
                disabled={isLoading}
                className="transition-all"
                aria-label="Open chat with seller"
              >
                <MessageCircleMore className="w-5 h-5" />
                {messageCount > 0 && (
                  <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                    {messageCount}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chat with seller</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Chat Modal */}
      <Dialog open={showChat} onOpenChange={setShowChat}>
        <DialogContent className="sm:max-w-[425px] w-[95vw] h-[85vh] sm:h-[600px] max-h-[600px] p-0 flex flex-col overflow-hidden">
          <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <MessageCircleMore className="w-4 h-4 sm:w-5 sm:h-5" />
              Chat with Seller
            </DialogTitle>
            {itemName && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                Regarding: {itemName}
              </p>
            )}
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-4 sm:px-6">
              <div className="py-4 space-y-3 sm:space-y-4">
                {isLoading ? (
                  <p className="text-center text-muted-foreground">
                    Initializing chat...
                  </p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-muted-foreground italic">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          <div className="border-t px-4 sm:px-6 py-3 sm:py-4 shrink-0 bg-background">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isLoading
                    ? "Loading..."
                    : conversationId
                    ? "Type your message..."
                    : "Click to start chat"
                }
                disabled={isLoading || !conversationId}
                className="flex-1 text-sm"
                maxLength={500}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || !conversationId}
                size="icon"
                className="shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {inputValue.length > 400 && (
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                {500 - inputValue.length} characters remaining
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
