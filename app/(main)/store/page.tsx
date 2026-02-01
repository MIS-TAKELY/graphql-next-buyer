import React from "react";
import { prisma } from "@/lib/db/prisma";
import { Metadata } from "next";
import StoreList from "@/components/page/store/StoreList";

export const revalidate = 3600; // ISR: Revalidate every hour

export const metadata: Metadata = {
    title: "Official Stores | Vanijay Nepal",
    description: "Explore official and verified stores on Vanijay Nepal. Shop from your favorite brands and local sellers with confidence.",
};

export default async function StoresPage() {
    const sellers = await prisma.sellerProfile.findMany({
        where: {
            isActive: true,
            verificationStatus: "APPROVED",
        },
        select: {
            id: true,
            shopName: true,
            slug: true,
            logo: true,
            banner: true,
            tagline: true,
            averageRating: true,
            user: {
                select: {
                    _count: {
                        select: {
                            products: {
                                where: {
                                    status: "ACTIVE",
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            shopName: "asc",
        },
    });

    const formattedSellers = sellers.map((seller) => ({
        ...seller,
        averageRating: seller.averageRating ? Number(seller.averageRating) : 0,
        totalProducts: (seller.user as any)?._count?.products || 0,
    }));

    return (
        <div className="container-custom py-12 min-h-screen">
            <StoreList initialStores={formattedSellers as any} />
        </div>
    );
}
