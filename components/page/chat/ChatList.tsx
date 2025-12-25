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
                            const hasUnread = conv.unreadCount > 0 && !isSelected;

                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => onSelect(conv.id, conv.product, otherUser)}
                                    className={cn(
                                        "flex items-start gap-3 p-3 text-left transition-all rounded-lg hover:bg-muted/50 w-full group relative",
                                        isSelected && "bg-muted"
                                    )}
                                >
                                    <Avatar className="h-10 w-10 border shrink-0">
                                        <AvatarImage src={otherUser.avatarImageUrl} />
                                        <AvatarFallback className="bg-primary/5">{otherUser.firstName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0 overflow-hidden pr-2">
                                        <div className="flex items-center justify-between mb-0.5 mt-0.5">
                                            <span className={cn(
                                                "text-sm truncate leading-none",
                                                hasUnread ? "font-bold text-foreground" : "font-semibold text-foreground/90"
                                            )}>
                                                {otherUser.firstName} {otherUser.lastName}
                                            </span>
                                            {conv.lastMessage && (
                                                <span className={cn(
                                                    "text-[10px] shrink-0 tabular-nums",
                                                    hasUnread ? "font-bold text-primary" : "text-muted-foreground/70"
                                                )}>
                                                    {formatDistanceToNow(new Date(conv.lastMessage.sentAt), {
                                                        addSuffix: false,
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground/60 truncate font-medium mb-0.5">
                                            {conv.product.name}
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={cn(
                                                "text-xs truncate transition-colors",
                                                hasUnread ? "font-semibold text-foreground" : "text-muted-foreground/70"
                                            )}>
                                                {conv.lastMessage?.content || "Sent an attachment"}
                                            </p>
                                            {hasUnread && (
                                                <div className="h-5 min-w-[20px] px-1.5 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full shadow-sm animate-in zoom-in duration-300">
                                                    {conv.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {hasUnread && !isSelected && (
                                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full opacity-100 group-hover:h-10 transition-all duration-200" />
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}