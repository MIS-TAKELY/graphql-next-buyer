"use client";

import { TProduct } from "@/types/product";
import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Sparkles, StopCircle, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Message {
    role: "user" | "assistant";
    content: string;
    isStreaming?: boolean;
}

interface ProductAiBotProps {
    product: TProduct;
    user?: any;
}

const STORAGE_KEY_PREFIX = "vanijay_ai_chat_";

function sanitizeHtmlToMarkdown(text: string): string {
    let result = text;
    result = result.replace(/<br\s*\/?>/gi, "\n");
    result = result.replace(/<\/p>/gi, "\n");
    result = result.replace(/<p[^>]*>/gi, "");
    result = result.replace(/<(?:strong|b)>(.*?)<\/(?:strong|b)>/gi, "**$1**");
    result = result.replace(/<(?:em|i)>(.*?)<\/(?:em|i)>/gi, "*$1*");
    result = result.replace(/<li[^>]*>/gi, "- ");
    result = result.replace(/<\/li>/gi, "\n");
    result = result.replace(/<\/?(?:ul|ol|div|span|h[1-6])[^>]*>/gi, "\n");
    result = result.replace(/<[^>]+>/g, "");
    result = result.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");
    result = result.replace(/\n{3,}/g, "\n\n");
    return result.trim();
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, j) =>
        part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j}>{part.slice(2, -2)}</strong>
        ) : (
            <span key={j}>{part}</span>
        )
    );
}

function MessageContent({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
    const sanitized = sanitizeHtmlToMarkdown(content);
    const lines = sanitized.split(/\n/).filter(Boolean);

    return (
        <div className="space-y-4 text-[14px] leading-relaxed text-foreground/90">
            {lines.map((line, i) => {
                const bulletMatch = line.match(/^\s*[-*•]\s+(.*)/);
                if (bulletMatch) {
                    return (
                        <div key={i} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-1 duration-300">
                            <span className="mt-[7.5px] w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0 shadow-sm" />
                            <span className="flex-1">{renderInlineMarkdown(bulletMatch[1])}</span>
                        </div>
                    );
                }
                return (
                    <p key={i} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                        {renderInlineMarkdown(line)}
                    </p>
                );
            })}
            {isStreaming && (
                <span className="inline-block w-[2px] h-[15px] bg-primary/60 ml-1.5 align-middle animate-pulse rounded-full shadow-sm" />
            )}
        </div>
    );
}

export default function ProductAiBot({ product, user }: ProductAiBotProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const abortRef = useRef<AbortController | null>(null);
    const hasInitialLoaded = useRef(false);

    const storageKey = `${STORAGE_KEY_PREFIX}${product.id}`;

    // Save messages to localStorage when they change
    useEffect(() => {
        if (messages.length > 0) {
            const toStore = messages.map(m => ({
                role: m.role,
                content: m.content
            })).filter(m => m.content.trim() !== "");

            if (toStore.length > 0) {
                localStorage.setItem(storageKey, JSON.stringify(toStore));
            }
        }
    }, [messages, storageKey]);

    // Auto-scroll to bottom whenever messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        }
    }, [messages]);

    const stopGeneration = useCallback(() => {
        abortRef.current?.abort();
        setIsLoading(false);
        setMessages((prev) => {
            const updated = [...prev];
            if (updated.length > 0) {
                updated[updated.length - 1] = { ...updated[updated.length - 1], isStreaming: false };
            }
            return updated;
        });
    }, []);

    const clearChat = useCallback(() => {
        setIsClearModalOpen(false);
        localStorage.removeItem(storageKey);
        setMessages([]);
        hasInitialLoaded.current = true; // Stay in initialized state
        handleSend("INITIAL_GREETING");
    }, [storageKey]);

    const handleSend = async (overrideInput?: string) => {
        const messageText = overrideInput || input;
        if ((!messageText.trim() && overrideInput === undefined) || isLoading) return;

        // Capture current state to avoid closure issues
        const historySnapshot = messages;

        const userMessage: Message | null = overrideInput ? null : { role: "user", content: messageText };
        if (userMessage) {
            setMessages((prev) => [...prev, userMessage]);
            setInput("");
        }
        setIsLoading(true);

        const messagesForAi = userMessage ? [...historySnapshot, userMessage] : historySnapshot;

        setMessages((prev) => [...prev, { role: "assistant", content: "", isStreaming: true }]);

        abortRef.current = new AbortController();

        try {
            const response = await fetch("/api/ai/product-info", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product,
                    messages: messagesForAi,
                    isInitial: !!overrideInput,
                    user,
                }),
                signal: abortRef.current.signal,
            });

            if (!response.ok || !response.body) {
                let errMsg = "AI Assistant is currently busy. Please try again in a moment.";
                try {
                    const errData = await response.json();
                    errMsg = errData.error || errMsg;
                } catch { /* may be HTML */ }
                throw new Error(errMsg);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                accumulated += decoder.decode(value, { stream: true });
                setMessages((prev) => {
                    const updated = [...prev];
                    if (updated.length > 0) {
                        updated[updated.length - 1] = {
                            role: "assistant",
                            content: accumulated,
                            isStreaming: true,
                        };
                    }
                    return updated;
                });
            }

            setMessages((prev) => {
                const updated = [...prev];
                if (updated.length > 0) {
                    updated[updated.length - 1] = { role: "assistant", content: accumulated, isStreaming: false };
                }
                return updated;
            });
        } catch (error: any) {
            if (error.name === "AbortError") return;
            console.error(error);
            setMessages((prev) => {
                const updated = [...prev];
                if (updated.length > 0) {
                    updated[updated.length - 1] = {
                        role: "assistant",
                        content: error.message === "Failed to fetch"
                            ? "I'm having trouble connecting to the server. Please check your internet or try again later."
                            : (error.message || "Sorry, I ran into an error. Please try again."),
                        isStreaming: false,
                    };
                }
                return updated;
            });
        } finally {
            setIsLoading(false);
            abortRef.current = null;
            if (!overrideInput) {
                inputRef.current?.focus();
            }
        }
    };

    // Unified initialization: Load history OR Greeting
    useEffect(() => {
        if (hasInitialLoaded.current) return;
        hasInitialLoaded.current = true;

        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as Message[];
                if (parsed.length > 0) {
                    setMessages(parsed.map(m => ({ ...m, isStreaming: false })));
                    return;
                }
            } catch (err) {
                console.error("Failed to parse stored chat:", err);
            }
        }

        handleSend("INITIAL_GREETING");
    }, [storageKey]);

    return (
        <div className="mt-8">
            {/* Section Header */}
            <div className="flex items-center gap-2.5 mb-4">
                <div className="p-1.5 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                    <Image 
                        src="/final_blue_logo_500by500.svg" 
                        alt="AI Assistant" 
                        width={20} 
                        height={20} 
                        className="object-contain"
                    />
                </div>
                <h3 className="text-base font-semibold text-foreground tracking-tight">AI Product Assistant</h3>
                <span className="ml-auto text-[10px] text-muted-foreground px-2 py-0.5 rounded-full border border-border bg-muted">
                    Beta
                </span>
            </div>

            {/* Chat Container */}
            <div className="border border-border rounded-2xl overflow-hidden flex flex-col bg-background shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                style={{ height: 500 }}>

                {/* Header bar */}
                <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border/50 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                            <Image 
                                src="/final_blue_logo_500by500.svg" 
                                alt="AI Assistant" 
                                width={18} 
                                height={18} 
                                className="object-contain"
                            />
                        </div>
                        <span className="text-sm font-semibold text-foreground tracking-tight">Vanijay AI Assistant</span>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        {isLoading && (
                            <span className="flex items-center gap-2 text-[11px] font-medium text-primary animate-pulse">
                                <span className="flex gap-1">
                                    <span className="w-1 h-1 rounded-full bg-current" />
                                    <span className="w-1 h-1 rounded-full bg-current" />
                                    <span className="w-1 h-1 rounded-full bg-current" />
                                </span>
                                Thinking...
                            </span>
                        )}
                        <button
                            onClick={() => setIsClearModalOpen(true)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
                            title="Clear conversation"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto px-6 py-6 space-y-8"
                    style={{ scrollbarWidth: "none" }}
                >
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex gap-4 max-w-full group animate-in fade-in slide-in-from-bottom-2 duration-300",
                                msg.role === "user" ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            {/* Avatar */}
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm border border-border/50",
                                msg.role === "assistant"
                                    ? "bg-gradient-to-tr from-primary/20 to-primary/5 text-primary border-primary/20"
                                    : "bg-secondary text-foreground"
                            )}>
                                {msg.role === "assistant" ? (
                                    <div className="relative w-5 h-5">
                                        <Image 
                                            src="/final_blue_logo_500by500.svg" 
                                            alt="AI" 
                                            fill 
                                            className={cn("object-contain", msg.isStreaming && "animate-pulse")}
                                        />
                                    </div>
                                ) : (
                                    <User size={16} />
                                )}
                            </div>

                            {/* Content */}
                            <div className={cn(
                                "flex flex-col gap-1.5",
                                msg.role === "user" ? "items-end max-w-[85%]" : "items-start max-w-[90%]"
                            )}>
                                <div className={cn(
                                    "text-sm leading-relaxed",
                                    msg.role === "user" 
                                        ? "bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl rounded-tr-none shadow-sm" 
                                        : "text-foreground pt-1"
                                )}>
                                    {msg.content === "" && msg.isStreaming ? (
                                        <div className="flex gap-1.5 items-center py-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0ms]" />
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:150ms]" />
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:300ms]" />
                                        </div>
                                    ) : (
                                        <MessageContent content={msg.content} isStreaming={msg.isStreaming} />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-background border-t border-border/50 shrink-0">
                    <div className="relative group">
                        <div className="flex items-end gap-2 bg-muted/50 border border-border/50 rounded-[26px] p-1.5 transition-all focus-within:border-primary/30 focus-within:bg-background focus-within:ring-4 focus-within:ring-primary/5">
                            <textarea
                                rows={1}
                                ref={inputRef}
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    e.target.style.height = "auto";
                                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Message Vanijay Assistant..."
                                disabled={isLoading}
                                className="flex-1 bg-transparent text-[13.5px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none py-2 px-3.5 disabled:opacity-60 resize-none min-h-[36px] max-h-[120px]"
                            />
                            <div className="flex items-center justify-center pr-1 pb-1">
                                {isLoading ? (
                                    <button
                                        onClick={stopGeneration}
                                        className="w-10 h-10 flex items-center justify-center text-white bg-gradient-to-tr from-destructive to-[#ff6b6b] hover:opacity-90 rounded-full transition-all shadow-lg shadow-destructive/20"
                                        title="Stop generating"
                                    >
                                        <StopCircle size={20} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleSend()}
                                        disabled={!input.trim()}
                                        className="w-10 h-10 flex items-center justify-center text-white bg-gradient-to-tr from-[#0040c7] to-[#149df3] hover:opacity-90 rounded-full transition-all shadow-lg disabled:opacity-0 disabled:scale-90 scale-100"
                                        title="Send message"
                                    >
                                        <Send size={18} className="translate-x-[1px] -translate-y-[0.5px]" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 mt-3 text-center font-medium tracking-wide uppercase">
                        AI may provide inaccurate info.
                    </p>
                </div>
            </div>

            {/* Clear Chat Confirmation Modal */}
            <Dialog open={isClearModalOpen} onOpenChange={setIsClearModalOpen}>
                <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-6 h-6 text-destructive" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-semibold text-foreground">
                                    Clear Chat History?
                                </DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground mt-1">
                                    This will permanently delete your current conversation with the assistant.
                                </DialogDescription>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setIsClearModalOpen(false)}
                                className="flex-1 h-11 font-medium rounded-xl border-border/50 hover:bg-muted transition-colors"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={clearChat}
                                className="flex-1 h-11 font-medium rounded-xl shadow-lg shadow-destructive/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Yes, Clear Chat
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
