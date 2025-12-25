"use client";

import { useRealChat } from "@/hooks/chat/useRealChat";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChatList } from "./ChatList";
import { ChatWindow } from "./ChatWindow";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useQuery } from "@apollo/client";
import { GET_ALL_CONVERSATIONS } from "@/client/conversatation/conversatation.query";

interface ChatLayoutProps {
    userId: string;
}

export function ChatLayout({ userId }: ChatLayoutProps) {
    const { data: convData, loading: convLoading, error: convError, refetch: refetchConversations } = useQuery(GET_ALL_CONVERSATIONS, {
        fetchPolicy: "cache-and-network",
    });

    const [selectedChat, setSelectedChat] = useState<{
        id: string;
        product: any;
        otherUser: any;
    } | null>(null);

    const searchParams = useSearchParams();
    const urlConvId = searchParams.get("conversation");

    useEffect(() => {
        if (urlConvId && convData?.conversations) {
            const conv = convData.conversations.find((c: any) => c.id === urlConvId);
            if (conv) {
                const otherUser = conv.sender.id === userId ? conv.reciever : conv.sender;
                setSelectedChat({ id: conv.id, product: conv.product, otherUser });
            }
        }
    }, [urlConvId, convData, userId]);

    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const showList = !selectedChat || isDesktop;
    const showChat = !!selectedChat || isDesktop;

    // Pass the selected chat ID (conversationId) directly to the hook
    const {
        conversationId: activeConvId,
        messages: activeMessages,
        initializeChat,
        handleSend: onSend,
        isLoading: loadingChat,
        error: chatError,
    } = useRealChat(selectedChat?.product?.id, selectedChat?.id, refetchConversations);

    // Trigger init when selected chat changes
    useEffect(() => {
        if (selectedChat?.id || selectedChat?.product?.id) {
            initializeChat();
        }
    }, [selectedChat, initializeChat]);

    const handleSelectChat = (id: string, product: any, otherUser: any) => {
        setSelectedChat({ id, product, otherUser });
    };

    const handleBack = () => {
        setSelectedChat(null);
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] w-full max-w-7xl mx-auto border rounded-xl overflow-hidden shadow-sm bg-background">
            {/* Sidebar / List */}
            <div
                className={`${showList ? "block" : "hidden"
                    } w-full lg:w-80 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col`}
            >
                <ChatList
                    selectedId={selectedChat?.id || null}
                    onSelect={handleSelectChat}
                    userId={userId}
                    conversations={convData?.conversations || []}
                    loading={convLoading}
                    error={convError}
                />
            </div>

            {/* Main Chat Window */}
            <div
                className={`${showChat ? "flex" : "hidden"
                    } flex-1 flex-col min-w-0 bg-white dark:bg-slate-950`}
            >
                {selectedChat ? (
                    <ChatWindow
                        conversation={{
                            id: selectedChat.id,
                            product: selectedChat.product,
                            sender: selectedChat.otherUser,
                            reciever: selectedChat.otherUser,
                        } as any}
                        messages={activeMessages}
                        isLoading={loadingChat}
                        error={chatError}
                        onSend={onSend}
                        onBack={handleBack}
                        currentUserId={userId}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                            <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Select a conversation to start chatting</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}