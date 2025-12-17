"use client";

import { askQuestion, getQuestions } from "@/app/actions/faq";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export interface Answer {
    id: string;
    content: string;
    createdAt: Date;
    seller: {
        sellerProfile?: {
            shopName: string;
        } | null;
    };
}

export interface Question {
    id: string;
    content: string;
    createdAt: Date;
    user: {
        firstName: string | null;
        lastName: string | null;
    };
    answers: Answer[];
}

export function useProductFAQ(productId: string) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Fetch
    useEffect(() => {
        getQuestions(productId)
            .then((data: any) => {
                setQuestions(
                    data.map((q: any) => ({
                        ...q,
                        createdAt: new Date(q.createdAt),
                        answers: q.answers.map((a: any) => ({
                            ...a,
                            createdAt: new Date(a.createdAt),
                        })),
                    }))
                );
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to load FAQs");
            })
            .finally(() => setIsLoading(false));
    }, [productId]);

    const submitQuestion = useCallback(async (content: string) => {
        // Generate temporary ID for optimistic update
        const tempId = `temp-${Date.now()}`;
        const tempQuestion: Question = {
            id: tempId,
            content,
            createdAt: new Date(),
            user: {
                firstName: "You",
                lastName: null,
            },
            answers: [],
        };

        // Optimistic update - add question immediately
        setQuestions((prev) => [tempQuestion, ...prev]);

        try {
            const question = await askQuestion(productId, content);

            // Replace temp question with real one
            setQuestions((prev) =>
                prev.map((q) =>
                    q.id === tempId
                        ? {
                            id: question.id,
                            content: question.content,
                            createdAt: new Date(question.createdAt),
                            user: question.user,
                            answers: [],
                        }
                        : q
                )
            );

            toast.success("Question submitted!");
        } catch (error) {
            // Remove temp question on error
            setQuestions((prev) => prev.filter((q) => q.id !== tempId));
            toast.error("Failed to submit question");
            console.error(error);
            throw error;
        }
    }, [productId]);

    return { questions, isLoading, submitQuestion };
}
