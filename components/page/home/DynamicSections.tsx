// components/page/home/DynamicSections.tsx
"use client";

import { useState, useEffect } from "react";
import ProductSection from "./ProductSection";
import { TProduct } from "@/types/product";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS } from "@/client/product/product.queries";

export default function DynamicSections() {
    const [isMounted, setIsMounted] = useState(false);
    const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
    const [recommendations, setRecommendations] = useState<TProduct[]>([]);

    // Fetch all products to filter/display (mocking real API behavior for now)
    const { data, loading, error } = useQuery(GET_PRODUCTS);
    const allProducts = (data?.getProducts || []) as TProduct[];

    useEffect(() => {
        setIsMounted(true);
    }, []);

    console.log("DynamicSections Debug:", {
        isMounted,
        loading,
        error,
        productsCount: allProducts.length,
        recentlyViewedIds,
        recommendationsCount: recommendations.length
    });

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

    useEffect(() => {
        if (allProducts.length > 0) {
            console.log("Generating recommendations from", allProducts.length, "products");
            // Simple recommendation: Random products excluding recently viewed
            const available = allProducts.filter((p: any) => !recentlyViewedIds.includes(p.id));
            // Shuffle array to get random recommendations
            const shuffled = [...available].sort(() => 0.5 - Math.random());
            setRecommendations(shuffled.slice(0, 8));
        }
    }, [allProducts, recentlyViewedIds]);

    const recentlyViewedProducts = allProducts.filter((p: any) =>
        recentlyViewedIds.includes(p.id)
    );

    // Prevent hydration mismatch
    if (!isMounted) return null;

    // Only show if we have content in either section
    if (recentlyViewedProducts.length === 0 && recommendations.length === 0) return null;

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
            {recommendations.length > 0 && (
                <ProductSection
                    name="Recommended for You"
                    products={recommendations}
                    count={recommendations.length}
                    layout="horizontal"
                />
            )}
        </div>
    );
}
