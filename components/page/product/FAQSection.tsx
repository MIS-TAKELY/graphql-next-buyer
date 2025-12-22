"use client";

import { useProductFAQ } from "@/hooks/faq/useProductFAQ";
import { formatDistanceToNow } from "date-fns";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import Link from "next/link";

export default function FAQSection({ productId, isOwnProduct }: { productId: string; isOwnProduct?: boolean }) {
    const { questions, isLoading, submitQuestion } = useProductFAQ(productId);
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAskForm, setShowAskForm] = useState(false);
    const questionsListRef = useRef<HTMLDivElement>(null);

    const handleSubmit = async () => {
        if (!content.trim()) return;
        setIsSubmitting(true);

        // Clear input immediately for instant feedback
        const questionContent = content;
        setContent("");
        setShowAskForm(false);

        try {
            await submitQuestion(questionContent);

            // Scroll to the questions list to show the newly submitted question
            setTimeout(() => {
                questionsListRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });
            }, 100);
        } catch (error) {
            console.error("FAQ submission error:", error);
            // Restore value on error
            setContent(questionContent);
            setShowAskForm(true);
            toast.error("Failed to submit question. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="space-y-4 py-4 border-t">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Questions & Answers</h2>
            </div>

            {/* Ask Form */}
            {!isOwnProduct && (
                <div className="space-y-3 bg-muted/30 p-4 rounded-lg border border-border">
                    {isSignedIn ? (
                        <>
                            <Textarea
                                placeholder="Ask a question about this product..."
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                className="min-h-[80px] text-sm"
                            />
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleSubmit} disabled={isSubmitting || !content.trim()}>
                                    {isSubmitting ? "Submitting..." : "Submit"}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-2">Login to ask a question</p>
                            <Button size="sm" variant="outline" asChild>
                                <Link href="/sign-in">Sign In</Link>
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* List */}
            <div ref={questionsListRef} className="space-y-3">
                {isLoading ? (
                    <p className="text-xs text-muted-foreground">Loading questions...</p>
                ) : questions.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2 italic">No questions yet. Be the first to ask!</p>
                ) : (
                    questions.slice(0, 3).map((q: any) => (
                        <div key={q.id} className="border-b last:border-0 pb-3 space-y-2">
                            <div className="flex justify-between items-start gap-3">
                                <h3 className="font-medium text-foreground text-sm leading-tight">{q.content}</h3>
                                <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                                    {formatDistanceToNow(new Date(q.createdAt))} ago
                                </span>
                            </div>

                            {q.answers.length > 0 && (
                                <div className="pl-3 border-l-2 border-primary/20 space-y-2">
                                    {q.answers.map((a: any) => (
                                        <div key={a.id} className="space-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-semibold text-primary text-[11px]">{a.seller.sellerProfile?.shopName || "Seller"}</span>
                                                <span className="text-[9px] text-muted-foreground">• {formatDistanceToNow(new Date(a.createdAt))} ago</span>
                                            </div>
                                            <p className="text-xs text-foreground/90 leading-normal">{a.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
                {questions.length > 3 && (
                    <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
                        View All Questions
                    </Button>
                )}
            </div>
        </section>
    );
}
