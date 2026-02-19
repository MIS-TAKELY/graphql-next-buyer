"use client";

import { TProduct } from "@/types/product";
import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User, X, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface ProductAiBotProps {
    product: TProduct;
}

export default function ProductAiBot({ product }: ProductAiBotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: `Hi! I'm your Vanijay Assistant. I can tell you more about the ${product.name}. What would you like to know?`,
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/ai/product-info", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product,
                    messages: [...messages, userMessage],
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to get AI response");
            }
            setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
        } catch (error: any) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: error.message || "Sorry, I encountered an error. Please try again later." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-8 border-t border-border pt-8">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                <h3 className="text-lg font-semibold text-foreground">AI Product Assistant</h3>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-[400px]">
                {/* Header */}
                <div className="bg-primary/5 px-4 py-3 border-b border-primary/10 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-primary">Chat with Assistant</span>
                </div>

                {/* Messages */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
                >
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex gap-3 max-w-[85%]",
                                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                                msg.role === "assistant" ? "bg-primary/10 border-primary/20 text-primary" : "bg-secondary border-border text-foreground"
                            )}>
                                {msg.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
                            </div>
                            <div className={cn(
                                "p-3 rounded-2xl text-sm leading-relaxed",
                                msg.role === "assistant"
                                    ? "bg-muted text-foreground rounded-tl-none border border-border"
                                    : "bg-primary text-primary-foreground rounded-tr-none"
                            )}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3 max-w-[85%] mr-auto">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-primary/10 border-primary/20 text-primary">
                                <Bot size={16} />
                            </div>
                            <div className="p-3 rounded-2xl text-sm bg-muted text-foreground rounded-tl-none border border-border flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border bg-background">
                    <div className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Ask anything about this product..."
                            className="w-full bg-muted border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-12"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="absolute right-1 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 text-center">
                        AI-generated content may contain inaccuracies.
                    </p>
                </div>
            </div>
        </div>
    );
}
