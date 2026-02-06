"use client";

import { useQuery } from "@apollo/client";
import { GET_PRODUCTS_BY_CATEGORY } from "@/client/category/category.queries";
import ProductCard from "@/components/search/ProductCard";
import ProductCardSkeleton from "@/components/search/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { Package } from "lucide-react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";

interface SeoPageClientProps {
    seoPage: any;
}

const ITEMS_PER_PAGE = 20;

export default function SeoPageClient({ seoPage }: SeoPageClientProps) {
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [hasMore, setHasMore] = useState(true);

    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: "100px",
    });

    const { data, loading, fetchMore } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
        variables: {
            categorySlug: seoPage.category.slug,
            limit: ITEMS_PER_PAGE,
            offset: 0,
            maxPrice: seoPage.priceThreshold
        },
        notifyOnNetworkStatusChange: true,
    });

    useEffect(() => {
        if (data?.getProductsByCategory?.products) {
            const newProducts = data.getProductsByCategory.products;
            setAllProducts(newProducts);
            setHasMore(newProducts.length >= ITEMS_PER_PAGE);
        }
    }, [data]);

    const loadMore = useCallback(() => {
        if (loading || !hasMore) return;

        fetchMore({
            variables: {
                categorySlug: seoPage.category.slug,
                offset: allProducts.length,
                limit: ITEMS_PER_PAGE,
                maxPrice: seoPage.priceThreshold
            },
        }).then((res) => {
            const newProducts = res?.data?.getProductsByCategory?.products || [];
            if (newProducts.length === 0) {
                setHasMore(false);
            } else {
                setAllProducts(prev => [...prev, ...newProducts]);
                setHasMore(newProducts.length >= ITEMS_PER_PAGE);
            }
        });
    }, [allProducts.length, fetchMore, hasMore, loading, seoPage]);

    useEffect(() => {
        if (inView && hasMore && !loading) {
            loadMore();
        }
    }, [inView, hasMore, loading, loadMore]);

    const total = data?.getProductsByCategory?.total || 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Dynamic Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight mb-6">
                        {seoPage.metaTitle || seoPage.category.name}
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        {seoPage.metaDescription || seoPage.category.description}
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-4 text-sm font-medium text-muted-foreground">
                        <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full border border-primary/20">
                            {total} Hand-picked Products
                        </span>
                        {seoPage.priceThreshold && (
                            <span className="bg-green-500/10 text-green-600 px-4 py-1.5 rounded-full border border-green-500/20">
                                Under Rs. {seoPage.priceThreshold.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col gap-6">
                    {allProducts.map((product: any) => (
                        <ProductCard key={product.id} product={product} />
                    ))}

                    {/* Only show skeletons during infinite scroll, not initial load */}
                    {!loading && hasMore && inView && (
                        [...Array(4)].map((_, i) => (
                            <ProductCardSkeleton key={`skeleton-${i}`} />
                        ))
                    )}
                </div>

                <div ref={ref} className="h-20 w-full flex items-center justify-center mt-12" />

                {!loading && allProducts.length === 0 && (
                    <div className="text-center py-24 flex flex-col items-center">
                        <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-full mb-6">
                            <Package className="w-16 h-16 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">No deals found today</h3>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                            We're currently updating our selection. Check back soon for the best {seoPage.category.name} under your budget!
                        </p>
                        <Link href="/">
                            <Button size="lg">Explore Home</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
