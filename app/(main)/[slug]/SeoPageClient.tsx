"use client";

import { useQuery } from "@apollo/client";
import { GET_PRODUCTS_BY_CATEGORY } from "@/client/category/category.queries";
import ProductCard from "@/components/page/home/ProductCard";
import { ProductCardSkeleton } from "@/components/page/home/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Package } from "lucide-react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import Breadcrumb from "@/components/page/product/Breadcrumb";
import SortBar from "@/components/search/SortBar";

interface SeoPageClientProps {
    seoPage: any;
    initialProducts?: any[];
}

const ITEMS_PER_PAGE = 20;

export default function SeoPageClient({ seoPage, initialProducts = [] }: SeoPageClientProps) {
    const hasPinnedProducts = Boolean(seoPage.pinnedProducts && seoPage.pinnedProducts.length > 0);
    const [allProducts, setAllProducts] = useState<any[]>(initialProducts);
    const [hasMore, setHasMore] = useState(!hasPinnedProducts);
    const [sortBy, setSortBy] = useState("relevance");

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
        skip: hasPinnedProducts,
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-and-network',
    });

    useEffect(() => {
        if (!loading && data?.getProductsByCategory?.products) {
            const newProducts = data.getProductsByCategory.products;
            if (allProducts.length === 0 || allProducts.length === initialProducts.length) {
                setAllProducts(newProducts);
            }
            setHasMore(newProducts.length >= ITEMS_PER_PAGE);
        }
    }, [data, loading]);

    const loadMore = useCallback(() => {
        if (loading || !hasMore || allProducts.length === 0) return;

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
                setAllProducts(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const uniqueNewProducts = newProducts.filter((p: any) => !existingIds.has(p.id));
                    return [...prev, ...uniqueNewProducts];
                });
                setHasMore(newProducts.length >= ITEMS_PER_PAGE);
            }
        });
    }, [allProducts.length, fetchMore, hasMore, loading, seoPage.category.slug, seoPage.priceThreshold]);

    useEffect(() => {
        if (inView && hasMore && !loading && allProducts.length > 0) {
            loadMore();
        }
    }, [inView, hasMore, loading, loadMore, allProducts.length]);

    const filteredProducts = useMemo(() => {
        if (!Array.isArray(allProducts) || allProducts.length === 0) return [];

        let filtered = [...allProducts];

        // Sorting
        if (sortBy && sortBy !== "relevance") {
            switch (sortBy) {
                case "price-low":
                    filtered.sort((a, b) => (a.variants?.[0]?.price || 0) - (b.variants?.[0]?.price || 0));
                    break;
                case "price-high":
                    filtered.sort((a, b) => (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0));
                    break;
                case "rating":
                    filtered.sort((a, b) => {
                        const avgA = (a.reviews?.reduce((s: number, r: any) => s + r.rating, 0) || 0) / (a.reviews?.length || 1);
                        const avgB = (b.reviews?.reduce((s: number, r: any) => s + r.rating, 0) || 0) / (b.reviews?.length || 1);
                        return avgB - avgA;
                    });
                    break;
                case "popularity":
                    filtered.sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0));
                    break;
            }
        }

        return filtered;
    }, [allProducts, sortBy]);

    const total = data?.getProductsByCategory?.total || (hasPinnedProducts ? seoPage.pinnedProducts.length : (allProducts.length || initialProducts.length));

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vanijay.com";

    // Helper to format url path to a readable title
    const formatUrlTitle = (path: string) => {
        const slug = path.split('/').filter(Boolean).pop() || "";
        return slug
            .split('-')
            .map(word => {
                if (word.toLowerCase() === 'rs') return 'Rs.';
                if (!isNaN(Number(word))) return word;
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');
    };

    const displayTitle = seoPage.metaTitle || formatUrlTitle(seoPage.urlPath);

    // Breadcrumb JSON-LD
    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": baseUrl
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": seoPage.category.name,
                "item": `${baseUrl}/category/${seoPage.category.slug}`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": seoPage.metaTitle || seoPage.category.name,
                "item": `${baseUrl}${seoPage.urlPath}`
            }
        ]
    };

    // ItemList (CollectionPage) JSON-LD for rich snippets
    const itemListLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": seoPage.metaTitle || seoPage.category.name,
        "description": seoPage.metaDescription || seoPage.category.description,
        "numberOfItems": total,
        "itemListElement": allProducts.map((product, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `${baseUrl}/product/${product.slug}-p${product.id}`,
            "name": product.name,
            "image": product.images?.[0]?.url
        }))
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
            />
            {seoPage.structuredData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: typeof seoPage.structuredData === 'string' ? seoPage.structuredData : JSON.stringify(seoPage.structuredData) }}
                />
            )}
            {/* Dynamic Header */}
            <Breadcrumb
                category={seoPage.category}
                name={displayTitle}
            />

            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight leading-none">
                                <span className="capitalize">{displayTitle}</span>
                            </h1>
                            <div className="mt-1 text-[10px] sm:text-xs font-medium text-muted-foreground opacity-80">
                                Showing {filteredProducts.length} of {total} products
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <SortBar
                                sortBy={sortBy}
                                setSortBy={setSortBy}
                                showFilters={false}
                                setShowFilters={() => { }}
                                activeFiltersCount={0}
                                itemsPerPage={ITEMS_PER_PAGE}
                                setItemsPerPage={() => { }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="w-full">
                    {/* Product List */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}

                        {/* Skeleton Loaders: only during initial load, NOT during fetchMore/pagination */}
                        {loading && allProducts.length === 0 && (
                            [...Array(8)].map((_, i) => (
                                <ProductCardSkeleton key={`skeleton-${i}`} />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Infinite Scroll Trigger */}
            <div ref={ref} className="h-20 w-full flex items-center justify-center mt-8">
                {hasMore && !loading && (
                    <div className="animate-pulse text-muted-foreground text-sm">Loading more products...</div>
                )}
            </div>

            {/* No Results State */}
            {!loading && allProducts.length === 0 && (
                <div className="text-center py-20 flex flex-col items-center">
                    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
                        <Package className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No products found</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        We couldn't find any products in this category matching the criteria.
                    </p>
                    <Link href="/">
                        <Button variant="outline">Browse all Categories</Button>
                    </Link>
                </div>
            )}

            {/* End of results */}
            {!hasMore && allProducts.length > 0 && (
                <div className="text-center py-10 border-t border-gray-200 dark:border-gray-800 mt-10">
                    <p className="text-muted-foreground text-sm">You have reached the end of the list</p>
                </div>
            )}
        </div>
    );
}
