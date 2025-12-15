"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { LocalMessage } from "@/types/chat";
import { File, Loader2, Paperclip, Send, X, ArrowLeft, FileText } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { MessageBubble } from "./MessageBubble";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SelectedFile {
    file: File;
    preview?: string;
    name: string;
}

interface ChatWindowProps {
    product: { id: string; name: string; slug: string } | null;
    otherUser: { firstName: string; lastName: string; avatarImageUrl?: string } | null;
    messages: LocalMessage[];
    isLoading: boolean;
    error: string | null;
    onSend: (text: string, files?: File[]) => void;
    onBack?: () => void; // For mobile
}

export function ChatWindow({
    product,
    otherUser,
    messages,
    isLoading,
    error,
    onSend,
    onBack,
}: ChatWindowProps) {
    const [inputValue, setInputValue] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);



    // Cleanup previews on unmount or change
    useEffect(() => {
        return () => {
            selectedFiles.forEach(f => {
                if (f.preview) URL.revokeObjectURL(f.preview);
            });
        };
    }, [selectedFiles]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newFiles = files.map((file) => ({
                file,
                name: file.name,
                preview: file.type.startsWith("image/") || file.type.startsWith("video/")
                    ? URL.createObjectURL(file)
                    : undefined,
            }));
            setSelectedFiles((prev) => [...prev, ...newFiles]);
            // Reset input so same file can be selected again if needed
            e.target.value = "";
        }
    };

    const handleRemoveFile = (index: number) => {
        setSelectedFiles(prev => {
            const newFiles = [...prev];
            const removed = newFiles.splice(index, 1)[0];
            if (removed.preview) URL.revokeObjectURL(removed.preview);
            return newFiles;
        });
    };

    const handleSubmit = () => {
        if (!inputValue.trim() && !selectedFiles.length) return;
        onSend(
            inputValue,
            selectedFiles.map((f) => f.file)
        );
        setInputValue("");
        setSelectedFiles([]);
    };

    if (!product || !otherUser) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground h-full bg-slate-50 dark:bg-slate-900/50">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Send className="w-8 h-8 opacity-50" />
                </div>
                <p>Select a conversation to start chatting</p>
            </div>
        );
    }

    const getFileIcon = (sf: SelectedFile) => {
        if (sf.preview) return null; // Logic handled in render
        const nameLower = sf.name.toLowerCase();
        if (nameLower.endsWith(".pdf") || nameLower.endsWith(".doc") || nameLower.endsWith(".docx")) {
            return <FileText className="h-full w-full p-4 text-muted-foreground" />;
        }
        return <File className="h-full w-full p-4 text-muted-foreground" />;
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center gap-3 shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                {onBack && (
                    <Button variant="ghost" size="icon" onClick={onBack} className="mr-1 lg:hidden">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                )}
                <Avatar className="h-9 w-9 border">
                    <AvatarImage src={otherUser.avatarImageUrl} />
                    <AvatarFallback>{otherUser.firstName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold truncate">
                        {otherUser.firstName} {otherUser.lastName}
                    </h2>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        Re: <span className="font-medium text-primary">{product.name}</span>
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden relative bg-slate-50 dark:bg-slate-950/50">
                <ScrollArea className="h-full w-full">
                    <div className="p-4 flex flex-col gap-4 min-h-full justify-end">
                        {isLoading && messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-sm">Loading messages...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center gap-2 opacity-60">
                                <p className="text-sm">Start the conversation!</p>
                            </div>
                        ) : (
                            messages.map((msg, i) => {
                                // Simple sequence check could go here if needed for styling
                                return (
                                    <MessageBubble
                                        key={msg.clientId || msg.id}
                                        message={msg}
                                        isOwn={msg.sender === "user"}
                                    />
                                );
                            })
                        )}
                        {error && (
                            <div className="p-2 text-xs text-center text-red-500 bg-red-50 rounded">
                                {error}
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="p-3 bg-background border-t shrink-0">
                {selectedFiles.length > 0 && (
                    <div className="flex gap-2 mb-2 overflow-x-auto pb-2 scrollbar-none">
                        {selectedFiles.map((f, i) => (
                            <div
                                key={i}
                                className="relative h-16 w-16 shrink-0 rounded-lg border bg-muted flex items-center justify-center overflow-hidden group"
                            >
                                {f.preview ? (
                                    f.file.type.startsWith("image/") ? (
                                        <img
                                            src={f.preview}
                                            className="h-full w-full object-cover"
                                            alt="preview"
                                        />
                                    ) : (
                                        <video src={f.preview} className="h-full w-full object-cover" />
                                    )
                                ) : (
                                    getFileIcon(f)
                                )}
                                <button
                                    onClick={() => handleRemoveFile(i)}
                                    className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-2 items-end">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-primary"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <input
                        type="file"
                        multiple
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*,video/*,application/pdf,.doc,.docx"
                    />

                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) =>
                            e.key === "Enter" && !e.shiftKey && handleSubmit()
                        }
                        placeholder="Type a message..."
                        className="flex-1 bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 border-0"
                    />

                    <Button
                        onClick={handleSubmit}
                        disabled={!inputValue && !selectedFiles.length}
                        size="icon"
                        className={cn(
                            "shrink-0 transition-all",
                            inputValue || selectedFiles.length
                                ? "bg-primary"
                                : "bg-muted text-muted-foreground"
                        )}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
