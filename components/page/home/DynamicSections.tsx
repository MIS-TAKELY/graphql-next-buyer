// components/page/home/DynamicSections.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProductSection from "./ProductSection";
import { TProduct } from "@/types/product";
import { useQuery } from "@apollo/client";
import {
    GET_PRODUCTS_MINIMAL,
    GET_RECENTLY_VIEWED,
    GET_RECOMMENDED_PRODUCTS,
} from "@/client/product/product.queries";
import { useSession } from "@/lib/auth-client";

export default function DynamicSections() {
    const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
    // Use a ref to track if we've read localStorage yet (avoids 2nd render flash)
    const localStorageRead = useRef(false);

    const { data: session } = useSession();
    const isLoggedIn = !!session?.user;

    // Fetch recently viewed from API if logged in
    const { data: recentData } = useQuery(GET_RECENTLY_VIEWED, {
        skip: !isLoggedIn,
        fetchPolicy: "cache-first",
    });

    // Fetch limited products for fallback recommendations (cache-first: reuse SSR data when available)
    const { data: allProductsData } = useQuery(GET_PRODUCTS_MINIMAL, {
        variables: { limit: 12 },
        fetchPolicy: "cache-first",
    });
    const allProducts = useMemo(
        () => (allProductsData?.getProducts || []) as TProduct[],
        [allProductsData]
    );

    // Read localStorage only once, only for guests
    useEffect(() => {
        if (isLoggedIn || localStorageRead.current) return;
        localStorageRead.current = true;
        try {
            const stored = localStorage.getItem("recentlyViewed");
            if (stored) setRecentlyViewedIds(JSON.parse(stored));
        } catch (e) {
            console.error("Failed to parse recently viewed items", e);
        }
    }, [isLoggedIn]);

    // Personalized recommendations
    const { data: recData } = useQuery(GET_RECOMMENDED_PRODUCTS, {
        variables: { productId: null },
        fetchPolicy: "cache-first",
    });

    const recommendations = useMemo<TProduct[]>(() => {
        if (recData?.getRecommendedProducts?.length) {
            return recData.getRecommendedProducts;
        }
        if (allProducts.length > 0) {
            const available = allProducts.filter((p) => !recentlyViewedIds.includes(p.id));
            return [...available].sort(() => 0.5 - Math.random()).slice(0, 8);
        }
        return [];
    }, [recData, allProducts, recentlyViewedIds]);

    const recentlyViewedProducts = useMemo<TProduct[]>(
        () =>
            isLoggedIn
                ? (recentData?.getRecentlyViewed || [])
                : allProducts.filter((p) => recentlyViewedIds.includes(p.id)),
        [isLoggedIn, recentData, allProducts, recentlyViewedIds]
    );

    // Don't render until we have something to show
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
