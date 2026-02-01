"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Store } from "lucide-react";

interface StoreCardProps {
    store: {
        id: string;
        shopName: string;
        slug: string;
        logo: string | null;
        banner: string | null;
        tagline: string | null;
        averageRating: number | null;
        totalProducts?: number;
    };
}

export default function StoreCard({ store }: StoreCardProps) {
    return (
        <Link href={`/store/${store.slug}`} className="block group">
            <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg border-none bg-white dark:bg-gray-900 rounded-xl">
                {/* Banner with Logo Overlay */}
                <div className="relative h-32 w-full bg-gray-100 dark:bg-gray-800">
                    {store.banner ? (
                        <Image
                            src={store.banner}
                            alt={store.shopName}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Store className="w-12 h-12" />
                        </div>
                    )}

                    {/* Logo Overlay */}
                    <div className="absolute -bottom-6 left-4 ring-4 ring-white dark:ring-gray-900 rounded-lg overflow-hidden bg-white dark:bg-gray-800 w-16 h-16 shadow-md z-10">
                        {store.logo ? (
                            <Image
                                src={store.logo}
                                alt={`${store.shopName} logo`}
                                fill
                                className="object-contain p-1"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Store className="w-8 h-8" />
                            </div>
                        )}
                    </div>
                </div>

                <CardContent className="pt-8 pb-4 px-4 flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                        <h2 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
                            {store.shopName}
                        </h2>
                        {store.averageRating && store.averageRating > 0 && (
                            <div className="flex items-center gap-1 bg-green-600 text-white px-1.5 py-0.5 rounded text-xs font-bold shrink-0">
                                {Number(store.averageRating).toFixed(1)}
                                <Star className="w-3 h-3 fill-white" />
                            </div>
                        )}
                    </div>

                    {store.tagline && (
                        <p className="text-gray-500 text-sm line-clamp-2 min-h-[2.5rem]">
                            {store.tagline}
                        </p>
                    )}

                    <div className="flex items-center gap-4 mt-2">
                        {store.totalProducts !== undefined && (
                            <Badge variant="secondary" className="text-[10px] font-medium uppercase tracking-wider">
                                {store.totalProducts} Products
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
