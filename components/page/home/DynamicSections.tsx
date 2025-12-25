// components/page/home/DynamicSections.tsx
"use client";

import { useState, useEffect } from "react";
import ProductSection from "./ProductSection";
import { TProduct } from "@/types/product";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS_MINIMAL, GET_RECENTLY_VIEWED, GET_RECOMMENDED_PRODUCTS } from "@/client/product/product.queries";
import { useSession } from "@/lib/auth-client";

export default function DynamicSections() {
    const [isMounted, setIsMounted] = useState(false);
    const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
    const [recommendations, setRecommendations] = useState<TProduct[]>([]);

    const { data: session } = useSession();

    // Fetch recently viewed from API if logged in
    const { data: recentData } = useQuery(GET_RECENTLY_VIEWED, {
        skip: !session?.user,
        fetchPolicy: "network-only"
    });

    // Fetch limited products for fallback recommendations
    const { data, loading, error } = useQuery(GET_PRODUCTS_MINIMAL, {
        variables: { limit: 12 }
    });
    const allProducts = (data?.getProducts || []) as TProduct[];

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!session?.user) {
            // Load recently viewed IDs from localStorage if guest
            const stored = localStorage.getItem("recentlyViewed");
            if (stored) {
                try {
                    setRecentlyViewedIds(JSON.parse(stored));
                } catch (e) {
                    console.error("Failed to parse recently viewed items", e);
                }
            }
        }
    }, [session?.user]);

    // personalized recommendations
    const { data: recData } = useQuery(GET_RECOMMENDED_PRODUCTS, {
        variables: { productId: null }, // Landing page context
        // skip: !session?.user // Optional: skip if guest, but backend handles guest fallback too
    });

    useEffect(() => {
        if (recData?.getRecommendedProducts) {
            setRecommendations(recData.getRecommendedProducts);
        } else if (allProducts.length > 0 && recommendations.length === 0) {
            // Fallback to random if query returns empty (e.g. loading or error)
            // ... existing shuffle logic can stay as a last resort ...
            const available = allProducts.filter((p: any) => !recentlyViewedIds.includes(p.id));
            const shuffled = [...available].sort(() => 0.5 - Math.random());
            setRecommendations(shuffled.slice(0, 8));
        }
    }, [recData, allProducts, recentlyViewedIds]);

    const recentlyViewedProducts = session?.user
        ? (recentData?.getRecentlyViewed || [])
        : allProducts.filter((p: any) => recentlyViewedIds.includes(p.id));

    if (!isMounted) return null;
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
