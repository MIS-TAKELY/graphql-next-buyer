"use client";

import { TProduct } from "@/types/product";
import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Sparkles, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
    isStreaming?: boolean;
}

interface ProductAiBotProps {
    product: TProduct;
}

// Renders plain text with basic markdown-like formatting (bold, line breaks)
function MessageContent({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
    // Split by newlines to preserve paragraphs
    const paragraphs = content.split(/\n+/).filter(Boolean);

    return (
        <div className="space-y-1.5 text-[13.5px] leading-relaxed">
            {paragraphs.map((para, i) => {
                // Bold: **text**
                const parts = para.split(/(\*\*[^*]+\*\*)/g);
                return (
                    <p key={i}>
                        {parts.map((part, j) =>
                            part.startsWith("**") && part.endsWith("**") ? (
                                <strong key={j}>{part.slice(2, -2)}</strong>
                            ) : (
                                part
                            )
                        )}
                    </p>
                );
            })}
            {isStreaming && (
                <span className="inline-block w-[2px] h-[14px] bg-current ml-0.5 align-middle animate-[blink_0.8s_step-end_infinite] rounded-full" />
            )}
        </div>
    );
}

export default function ProductAiBot({ product }: ProductAiBotProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: `Hi! I'm your Vanijay Assistant. I can tell you more about the **${product.name}**. What would you like to know?`,
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    // Auto-scroll to bottom whenever messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        }
    }, [messages]);

    const stopGeneration = useCallback(() => {
        abortRef.current?.abort();
        setIsLoading(false);
        // Mark the last message as no longer streaming
        setMessages((prev) => {
            const updated = [...prev];
            if (updated.length > 0) {
                updated[updated.length - 1] = { ...updated[updated.length - 1], isStreaming: false };
            }
            return updated;
        });
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Insert streaming placeholder
        setMessages((prev) => [...prev, { role: "assistant", content: "", isStreaming: true }]);

        abortRef.current = new AbortController();

        try {
            const response = await fetch("/api/ai/product-info", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product,
                    messages: [...messages, userMessage],
                }),
                signal: abortRef.current.signal,
            });

            if (!response.ok || !response.body) {
                let errMsg = "Failed to get AI response";
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
                    updated[updated.length - 1] = {
                        role: "assistant",
                        content: accumulated,
                        isStreaming: true,
                    };
                    return updated;
                });
            }

            // Mark streaming complete
            setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: accumulated, isStreaming: false };
                return updated;
            });
        } catch (error: any) {
            if (error.name === "AbortError") return; // User stopped — already handled
            console.error(error);
            setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    role: "assistant",
                    content: error.message || "Sorry, I ran into an error. Please try again.",
                    isStreaming: false,
                };
                return updated;
            });
        } finally {
            setIsLoading(false);
            abortRef.current = null;
            inputRef.current?.focus();
        }
    };

    return (
        <div className="mt-8">
            {/* Section Header */}
            <div className="flex items-center gap-2.5 mb-4">
                <div className="p-1.5 rounded-lg bg-primary/10">
                    <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground tracking-tight">AI Product Assistant</h3>
                <span className="ml-auto text-[10px] text-muted-foreground px-2 py-0.5 rounded-full border border-border bg-muted">
                    Beta
                </span>
            </div>

            {/* Chat Container */}
            <div className="border border-border rounded-2xl overflow-hidden flex flex-col bg-background shadow-sm"
                style={{ height: 420 }}>

                {/* Header bar */}
                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-primary/5 border-b border-primary/10 shrink-0">
                    <div className="relative">
                        <Bot className="w-5 h-5 text-primary" />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 border border-background" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Vanijay Assistant</span>
                    {isLoading && (
                        <span className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span className="flex gap-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                            </span>
                            Generating
                        </span>
                    )}
                </div>

                {/* Messages */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
                    style={{ scrollbarWidth: "thin" }}
                >
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex gap-2.5 max-w-[88%] group",
                                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}
                        >
                            {/* Avatar */}
                            <div className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                msg.role === "assistant"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-secondary text-foreground"
                            )}>
                                {msg.role === "assistant" ? <Bot size={14} /> : <User size={14} />}
                            </div>

                            {/* Bubble */}
                            <div className={cn(
                                "rounded-2xl px-3.5 py-2.5 shadow-sm",
                                msg.role === "assistant"
                                    ? "bg-muted text-foreground rounded-tl-sm border border-border"
                                    : "bg-primary text-primary-foreground rounded-tr-sm"
                            )}>
                                {msg.content === "" && msg.isStreaming ? (
                                    // Initial loading dots before first token
                                    <div className="flex gap-1 items-center py-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                                    </div>
                                ) : (
                                    <MessageContent content={msg.content} isStreaming={msg.isStreaming} />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="px-3 pb-3 pt-2 border-t border-border bg-background shrink-0">
                    <div className="flex items-center gap-2 bg-muted rounded-xl border border-border px-3 py-1.5 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                            placeholder="Ask anything about this product…"
                            disabled={isLoading}
                            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-1 disabled:opacity-60"
                        />
                        {isLoading ? (
                            <button
                                onClick={stopGeneration}
                                className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                title="Stop generating"
                            >
                                <StopCircle size={17} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                                title="Send"
                            >
                                <Send size={17} />
                            </button>
                        )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                        AI-generated content may contain inaccuracies.
                    </p>
                </div>
            </div>
        </div>
    );
}
