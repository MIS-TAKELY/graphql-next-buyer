"use client";

import { askQuestion, getQuestions } from "@/app/actions/faq";
import { NewAnswerPayload, NewQuestionPayload } from "@/lib/realtime";
import { useRealtime } from "@upstash/realtime/client";
import { useCallback, useEffect, useMemo, useState } from "react";
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

    // Realtime Handlers
    const handleNewQuestion = useCallback(
        (payload: NewQuestionPayload) => {
            if (payload.productId !== productId) return;
            setQuestions((prev) => [
                {
                    id: payload.id,
                    content: payload.content,
                    createdAt: new Date(payload.createdAt), // Ensure date object
                    user: payload.user as any,
                    answers: [],
                },
                ...prev,
            ]);
        },
        [productId]
    );

    const handleNewAnswer = useCallback((payload: NewAnswerPayload) => {
        setQuestions((prev) =>
            prev.map((q) => {
                if (q.id === payload.questionId) {
                    return {
                        ...q,
                        answers: [
                            ...q.answers,
                            {
                                id: payload.id,
                                content: payload.content,
                                createdAt: new Date(payload.createdAt),
                                seller: {
                                    sellerProfile: { shopName: payload.seller.shopName },
                                },
                            },
                        ],
                    };
                }
                return q;
            })
        );
    }, []);

    const events = useMemo(
        () => ({
            faq: {
                newQuestion: handleNewQuestion,
                newAnswer: handleNewAnswer,
            },
        }),
        [handleNewQuestion, handleNewAnswer]
    );

    (useRealtime as any)({
        channel: `product:${productId}:faq`,
        events,
    });

    const submitQuestion = async (content: string) => {
        try {
            await askQuestion(productId, content);
            toast.success("Question submitted!");
        } catch (error) {
            toast.error("Failed to submit question");
            console.error(error);
            throw error;
        }
    };

    return { questions, isLoading, submitQuestion };
}
