import { prisma } from "../../../../lib/db/prisma";
import { realtime } from "@/lib/realtime";

export const faqResolvers = {
    Query: {
        getProductQuestions: async (_: any, { productId }: { productId: string }) => {
            // @ts-ignore
            return await prisma.productQuestion.findMany({
                where: { productId },
                include: {
                    user: true,
                    answers: {
                        include: {
                            seller: {
                                include: {
                                    sellerProfile: true
                                }
                            }
                        },
                        orderBy: { createdAt: "asc" },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
        },
    },
    Mutation: {
        askQuestion: async (_: any, { productId, content }: { productId: string; content: string }, context: any) => {
            if (!context.user) {
                throw new Error("Unauthorized");
            }

            const user = context.user;

            // @ts-ignore
            const question = await prisma.productQuestion.create({
                data: {
                    productId,
                    userId: user.id,
                    content,
                },
                include: {
                    user: true,
                },
            });

            // Emit Realtime Event
            try {
                await realtime.channel(`product:${productId}:faq`).emit("faq.newQuestion", {
                    id: question.id,
                    productId: question.productId,
                    content: question.content,
                    createdAt: question.createdAt,
                    user: {
                        firstName: question.user.firstName,
                        lastName: question.user.lastName,
                    },
                });
            } catch (e) {
                console.error("Failed to emit realtime event", e);
            }

            return {
                ...question,
                answers: [] // Return empty answers array for type safety
            };
        },
    },
};
