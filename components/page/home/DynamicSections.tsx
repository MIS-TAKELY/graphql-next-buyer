// components/page/home/DynamicSections.tsx
"use client";

import { useEffect, useState } from "react";
import ProductSection from "./ProductSection";
import { IProducts } from "@/types/product";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS } from "@/client/product/product.queries";

export default function DynamicSections() {
    const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
    const [recommendations, setRecommendations] = useState<IProducts[]>([]);

    // Fetch all products to filter/display (mocking real API behavior for now)
    const { data } = useQuery(GET_PRODUCTS);
    const allProducts = data?.getProducts || [];

    useEffect(() => {
        // Load recently viewed IDs from localStorage
        const stored = localStorage.getItem("recentlyViewed");
        if (stored) {
            try {
                setRecentlyViewedIds(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse recently viewed items", e);
            }
        }
    }, []);

    const recentlyViewedProducts = allProducts.filter((p: any) =>
        recentlyViewedIds.includes(p.id)
    );

    // Only show if we have content
    if (recentlyViewedProducts.length === 0) return null;

    return (
        <div className="space-y-12 mt-12">
            {recentlyViewedProducts.length > 0 && (
                <ProductSection
                    name="Recently Viewed"
                    products={recentlyViewedProducts}
                    count={recentlyViewedProducts.length}
                    layout="horizontal"
                />
            )}
        </div>
    );
}
