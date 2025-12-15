"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface ChatListProps {
    selectedId: string | null;
    onSelect: (id: string, product: any, otherUser: any) => void;
    userId: string;
    conversations: any[];
    loading: boolean;
    error?: any;
}

export function ChatList({ selectedId, onSelect, userId, conversations, loading, error }: ChatListProps) {
    const [filter, setFilter] = useState("");

    if (loading && !conversations?.length) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error && !conversations?.length) {
        return (
            <div className="p-4 text-center text-red-500 text-sm">
                Failed to load conversations
            </div>
        );
    }

    const filteredConversations = (conversations || [])
        .filter((conv: any) => {
            const otherUser = conv.sender.id === userId ? conv.reciever : conv.sender;
            const name = `${otherUser.firstName} ${otherUser.lastName}`.toLowerCase();
            const productName = conv.product.name.toLowerCase();
            const search = filter.toLowerCase();
            return name.includes(search) || productName.includes(search);
        })
        .sort((a: any, b: any) => {
            const dateA = new Date(a.lastMessage?.sentAt || a.updatedAt || 0).getTime();
            const dateB = new Date(b.lastMessage?.sentAt || b.updatedAt || 0).getTime();
            return dateB - dateA;
        });

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search messages..."
                        className="pl-8 bg-muted/50 border-none focus-visible:ring-1"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-1 p-2">
                    {filteredConversations.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            No messages found.
                        </div>
                    ) : (
                        filteredConversations.map((conv: any) => {
                            const otherUser =
                                conv.sender.id === userId ? conv.reciever : conv.sender;
                            const isSelected = selectedId === conv.id;

                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => onSelect(conv.id, conv.product, otherUser)}
                                    className={cn(
                                        "flex items-start gap-3 p-3 text-left transition-all rounded-lg hover:bg-muted/50",
                                        isSelected && "bg-muted"
                                    )}
                                >
                                    <Avatar className="h-10 w-10 border">
                                        <AvatarImage src={otherUser.avatarImageUrl} />
                                        <AvatarFallback>{otherUser.firstName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className="font-semibold text-sm truncate">
                                                {otherUser.firstName} {otherUser.lastName}
                                            </span>
                                            {conv.lastMessage && (
                                                <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                                                    {formatDistanceToNow(new Date(conv.lastMessage.sentAt), {
                                                        addSuffix: false,
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate font-medium text-primary/80 mb-0.5">
                                            {conv.product.name}
                                        </div>
                                        <p className="text-xs text-muted-foreground/80 truncate">
                                            {conv.lastMessage?.content || "Sent an attachment"}
                                        </p>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
