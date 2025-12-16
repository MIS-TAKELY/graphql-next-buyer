"use client";

import { useProductFAQ } from "@/hooks/faq/useProductFAQ";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function FAQSection({ productId }: { productId: string }) {
    const { questions, isLoading, submitQuestion } = useProductFAQ(productId);
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) return;
        setIsSubmitting(true);
        try {
            await submitQuestion(content);
            setContent("");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="space-y-6 mt-12 pt-8 border-t">
            <h2 className="text-2xl font-semibold">Questions & Answers</h2>

            {/* Ask Form */}
            <div className="space-y-4 max-w-2xl">
                <Textarea
                    placeholder="Ask a question about this product..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="min-h-[100px]"
                />
                <Button onClick={handleSubmit} disabled={isSubmitting || !content.trim()}>
                    {isSubmitting ? "Submitting..." : "Ask Question"}
                </Button>
            </div>

            {/* List */}
            <div className="space-y-6 mt-8">
                {isLoading ? (
                    <p className="text-muted-foreground">Loading specific questions...</p>
                ) : questions.length === 0 ? (
                    <p className="text-muted-foreground">No questions yet. Be the first to ask!</p>
                ) : (
                    questions.map(q => (
                        <div key={q.id} className="border p-4 rounded-lg bg-card space-y-3">
                            <div className="flex justify-between items-start gap-4">
                                <h3 className="font-medium text-foreground text-lg">{q.content}</h3>
                                <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                                    {formatDistanceToNow(new Date(q.createdAt))} ago
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">Asked by {q.user.firstName || "User"}</p>

                            {q.answers.length > 0 && (
                                <div className="mt-4 pl-4 border-l-2 border-primary/20 space-y-4">
                                    {q.answers.map(a => (
                                        <div key={a.id} className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-primary">{a.seller.sellerProfile?.shopName || "Seller"}</span>
                                                <span className="text-[10px] text-muted-foreground">• {formatDistanceToNow(new Date(a.createdAt))} ago</span>
                                            </div>
                                            <p className="text-sm text-foreground/90">{a.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
