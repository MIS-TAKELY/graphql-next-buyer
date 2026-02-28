"use server";

import { prisma } from "../../lib/db/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { pusher } from "@/lib/realtime";

export async function askQuestion(productId: string, content: string) {
    console.log("[FAQ] Starting askQuestion", { productId, content });

    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session || !session.user || !session.user.id) {
            console.error("[FAQ] Unauthorized: User ID missing or no session");
            throw new Error("Unauthorized");
        }

        const userId = session.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, firstName: true, lastName: true }
        });
        console.log("[FAQ] User from DB", { user });

        if (!user) {
            console.error("[FAQ] User not found in database");
            throw new Error("User not found");
        }

        console.log("[FAQ] Creating question in database...");

        // Wrap Prisma operation with timeout
        const question = await Promise.race([
            // @ts-ignore - Prisma types not generated yet
            prisma.productQuestion.create({
                data: {
                    productId,
                    userId: user.id,
                    content,
                },
                include: {
                    user: {
                        select: { firstName: true, lastName: true },
                    },
                },
            }),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Database operation timed out")), 10000)
            )
        ]) as any;

        console.log("[FAQ] Question created successfully", { questionId: question.id });

        // Revalidate the product page cache
        revalidatePath(`/product/${productId}`);
        console.log("[FAQ] Path revalidated, returning question");

        try {
            await pusher.trigger(`product-${productId}-faq`, "faq.newQuestion", {
                id: question.id,
                productId: question.productId,
                content: question.content,
                createdAt: question.createdAt,
                user: {
                    firstName: question.user.firstName,
                    lastName: question.user.lastName,
                },
            });
            console.log("[FAQ] Realtime event emitted");
        } catch (rtError) {
            console.error("[FAQ] Failed to emit realtime event:", rtError);
            // Don't fail the request if realtime fails
        }

        return question;
    } catch (error) {
        console.error("[FAQ] Error in askQuestion:", error);
        throw error;
    }
}

export async function getQuestions(productId: string) {
    // @ts-ignore
    return await prisma.productQuestion.findMany({
        where: { productId },
        include: {
            user: {
                select: { firstName: true, lastName: true },
            },
            answers: {
                include: {
                    seller: {
                        include: {
                            sellerProfile: {
                                select: { shopName: true }
                            }
                        }
                    },
                },
                orderBy: { createdAt: "asc" },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}
