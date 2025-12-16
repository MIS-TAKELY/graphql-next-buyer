"use server";

import { prisma } from "@/lib/db/prisma";
import { realtime } from "@/lib/realtime";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function askQuestion(productId: string, content: string) {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    const currentUserData = await currentUser();

    const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true, firstName: true, lastName: true }
    });

    if (!user) throw new Error("User not found");

    // @ts-ignore - Prisma types not generated yet
    const question = await prisma.productQuestion.create({
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
    });

    await realtime.channel(`product:${productId}:faq`).emit("faq.newQuestion", {
        id: question.id,
        productId: question.productId,
        content: question.content,
        createdAt: question.createdAt,
        user: {
            firstName: user.firstName,
            lastName: user.lastName,
        },
    });

    revalidatePath(`/product/${productId}`); // Or whatever the dynamic path is
    return question;
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
