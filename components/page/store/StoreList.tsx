"use client";

import React, { useState } from "react";
import StoreCard from "./StoreCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Store {
    id: string;
    shopName: string;
    slug: string;
    logo: string | null;
    banner: string | null;
    tagline: string | null;
    averageRating: number | null;
    totalProducts?: number;
}

interface StoreListProps {
    initialStores: Store[];
}

export default function StoreList({ initialStores }: StoreListProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredStores = initialStores.filter((store) =>
        store.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (store.tagline && store.tagline.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-8">
            {/* Search Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Official Stores</h1>
                    <p className="text-muted-foreground mt-1">Discover verified sellers on Vanijay</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search stores..."
                        className="pl-9 bg-white dark:bg-gray-800 border-none shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Store Grid */}
            {filteredStores.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredStores.map((store) => (
                        <StoreCard key={store.id} store={store} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                    <p className="text-muted-foreground text-lg">No stores found matching your search.</p>
                </div>
            )}
        </div>
    );
}
