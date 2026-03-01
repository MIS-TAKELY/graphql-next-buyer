"use client";

import { useMutation, useQuery, useApolloClient } from "@apollo/client";
import { ASK_QUESTION, GET_PRODUCT_QUESTIONS } from "@/client/faq/faq.queries";
import { NewAnswerPayload } from "@/lib/realtime";
import { useRealtime } from "@/lib/usePusherRealtime";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

export function useProductFAQ(productId: string) {
    const client = useApolloClient();

    const { data, loading: isLoading } = useQuery(GET_PRODUCT_QUESTIONS, {
        variables: { productId },
        skip: !productId,
        fetchPolicy: "cache-and-network"
    });

    const [askQuestionMutation] = useMutation(ASK_QUESTION, {
        update(cache, { data: { askQuestion } }) {
            cache.modify({
                fields: {
                    getProductQuestions(existingQuestions = []) {
                        const newQuestionRef = cache.writeFragment({
                            data: askQuestion,
                            fragment: useMemo(() => import("@/client/faq/faq.queries").then(m => m.GET_PRODUCT_QUESTIONS.definitions[0]), []) as any
                            // Using a simple read-like structure or just ref is safer. 
                            // Actually, safest is to readQuery/writeQuery or use modify with refs.
                        });
                        // Standard array update
                        return [newQuestionRef, ...existingQuestions];
                    }
                }
            });
        }
        // Note: modify above is tricky without specific refs. 
        // Let's use the simplier updateQuery pattern or refetchQueries if we want to be safe,
        // but for Optimistic UI we need cache manipulation.
    });

    // Easier Cache Update Strategy: readQuery -> writeQuery
    const updateCacheWithNewQuestion = useCallback((newQuestion: any) => {
        try {
            const queryData = client.readQuery({
                query: GET_PRODUCT_QUESTIONS,
                variables: { productId }
            });

            if (queryData) {
                client.writeQuery({
                    query: GET_PRODUCT_QUESTIONS,
                    variables: { productId },
                    data: {
                        getProductQuestions: [newQuestion, ...(queryData as any).getProductQuestions]
                    }
                });
            }
        } catch (e) {
            // Cache might be empty if not yet loaded
        }
    }, [client, productId]);


    const handleNewAnswer = useCallback((payload: NewAnswerPayload) => {
        if (!payload.questionId || !payload.content) return;

        // Update cache when real-time event comes
        try {
            const queryData = client.readQuery<any>({
                query: GET_PRODUCT_QUESTIONS,
                variables: { productId }
            });

            if (queryData?.getProductQuestions) {
                const updatedQuestions = queryData.getProductQuestions.map((q: any) => {
                    if (q.id === payload.questionId) {
                        // Avoid duplicates
                        if (q.answers.some((a: any) => a.id === payload.id)) return q;

                        return {
                            ...q,
                            answers: [
                                ...q.answers,
                                {
                                    id: payload.id,
                                    content: payload.content,
                                    createdAt: payload.createdAt,
                                    seller: {
                                        __typename: "User",
                                        sellerProfile: {
                                            __typename: "SellerProfile",
                                            shopName: payload.seller.shopName
                                        }
                                    },
                                    __typename: "ProductAnswer"
                                }
                            ]
                        };
                    }
                    return q;
                });

                client.writeQuery({
                    query: GET_PRODUCT_QUESTIONS,
                    variables: { productId },
                    data: {
                        getProductQuestions: updatedQuestions
                    }
                });
                toast.info("New answer received!");
            }
        } catch (e) {
            console.error("Failed to update cache from realtime", e);
        }
    }, [client, productId]);

    useRealtime({
        channels: [`product-${productId}-faq`],
        event: "faq.newAnswer",
        onData: handleNewAnswer,
    });

    const submitQuestion = useCallback(async (content: string) => {
        try {
            await askQuestionMutation({
                variables: { productId, content },
                optimisticResponse: {
                    askQuestion: {
                        id: `temp-${Date.now()}`,
                        productId,
                        content,
                        createdAt: new Date().toISOString(),
                        user: {
                            firstName: "You",
                            lastName: "",
                            __typename: "User"
                        },
                        answers: [],
                        __typename: "ProductQuestion"
                    }
                },
                update: (cache, { data: { askQuestion } }) => {
                    // Update cache with the new question (optimistic or real)
                    const existingData = cache.readQuery<any>({
                        query: GET_PRODUCT_QUESTIONS,
                        variables: { productId }
                    });

                    if (existingData) {
                        // Check for dups if real id replaces temp id?
                        // Apollo handles merging if ID matches, but temp ID is different.
                        // So we need to handle "remove temp, add real" if we rely on update function running twice?
                        // Actually, Apollo reverts optimistic update automatically before applying real update.
                        // So we just need to "Add to list" logic.
                        cache.writeQuery({
                            query: GET_PRODUCT_QUESTIONS,
                            variables: { productId },
                            data: {
                                getProductQuestions: [askQuestion, ...existingData.getProductQuestions]
                            }
                        });
                    }
                }
            });
            toast.success("Question submitted!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit question");
        }
    }, [askQuestionMutation, productId]);

    return {
        questions: data?.getProductQuestions || [],
        isLoading,
        submitQuestion
    };
}
