"use client";

import { useQuery } from "@apollo/client";
import { GET_PRODUCTS_BY_CATEGORY } from "@/client/category/category.queries";
import ProductCard from "@/components/search/ProductCard";
import ProductCardSkeleton from "@/components/search/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Package } from "lucide-react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import Breadcrumb from "@/components/page/product/Breadcrumb";
import { useProductStore } from "@/store/productStore";
import { useDynamicSearchFilter } from "@/hooks/dynamicSearchFilter/useDynamicSearchFilter";
import ActiveFilters from "@/components/search/ActiveFilters";
import SortBar from "@/components/search/SortBar";

interface SeoPageClientProps {
    seoPage: any;
    initialProducts?: any[];
}

const ITEMS_PER_PAGE = 20;

import FilterSidebar from "@/components/search/FilterSidebar";

export default function SeoPageClient({ seoPage, initialProducts = [] }: SeoPageClientProps) {
    const [allProducts, setAllProducts] = useState<any[]>(initialProducts);
    const [hasMore, setHasMore] = useState(true);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // Dynamic Filter Hooks
    const { dynamicSearchData, dynamicSearchFilterLoading } = useDynamicSearchFilter(seoPage.metaTitle || seoPage.category.name);

    // Zustand Store
    const {
        filters: storeFilters,
        toggleDynamicFilter,
        togglePriceRange,
        setMinRating,
        setFilters,
        resetFilters,
    } = useProductStore();

    const {
        selectedPriceRanges,
        dynamicFilters,
        minRating,
        sort: sortBy,
    } = storeFilters;

    const setSortBy = (sort: string) => setFilters({ sort });

    const getMaxPrice = useCallback(() => {
        if (selectedPriceRanges.length === 0) return seoPage.priceThreshold;
        let max = 0;
        let hasUnlimited = false;
        selectedPriceRanges.forEach(r => {
            if (r.includes('+')) hasUnlimited = true;
            const parts = r.split('-');
            if (parts.length === 2) {
                const v = parseInt(parts[1]);
                if (v > max) max = v;
            } else if (r.startsWith('0-')) {
                const v = parseInt(r.split('-')[1]);
                if (v > max) max = v;
            }
        });
        if (hasUnlimited) return undefined;
        return max > 0 ? (seoPage.priceThreshold ? Math.min(max, seoPage.priceThreshold) : max) : seoPage.priceThreshold;
    }, [selectedPriceRanges, seoPage.priceThreshold]);

    const effectiveMaxPrice = getMaxPrice();

    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: "100px",
    });

    const { data, loading, fetchMore } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
        variables: {
            categorySlug: seoPage.category.slug,
            limit: ITEMS_PER_PAGE,
            offset: 0,
            maxPrice: effectiveMaxPrice
        },
        notifyOnNetworkStatusChange: true,
    });

    useEffect(() => {
        if (!loading && data?.getProductsByCategory?.products) {
            const newProducts = data.getProductsByCategory.products;
            setAllProducts(newProducts);
            setHasMore(newProducts.length >= ITEMS_PER_PAGE);
        }
    }, [data, loading]); // Remove effectiveMaxPrice from dependencies to avoid stale updates

    // Reset list when filter definitely changes
    useEffect(() => {
        setAllProducts([]);
        setHasMore(true);
    }, [effectiveMaxPrice, dynamicFilters, minRating]);

    const loadMore = useCallback(() => {
        if (loading || !hasMore || allProducts.length === 0) return;

        fetchMore({
            variables: {
                categorySlug: seoPage.category.slug,
                offset: allProducts.length,
                limit: ITEMS_PER_PAGE,
                maxPrice: effectiveMaxPrice
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
    }, [allProducts.length, fetchMore, hasMore, loading, seoPage, effectiveMaxPrice]);

    useEffect(() => {
        if (inView && hasMore && !loading && allProducts.length > 0) {
            loadMore();
        }
    }, [inView, hasMore, loading, loadMore, allProducts.length]);

    const filteredProducts = useMemo(() => {
        if (!Array.isArray(allProducts)) return [];

        let filtered = [...allProducts].filter((product: any) => {
            const price = product.variants?.[0]?.price || 0;

            const matchesPrice =
                selectedPriceRanges.length === 0 ||
                selectedPriceRanges.some((range) => {
                    if (range.endsWith("+")) {
                        const min = parseInt(range);
                        return price >= min;
                    }
                    const [min, max] = range.split("-").map(Number);
                    return price >= min && price <= max;
                });

            // Calculate average rating
            const rating =
                product.reviews?.length > 0
                    ? product.reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) /
                    product.reviews.length
                    : 0;

            const matchesRating = rating >= minRating;

            const matchesDynamicFilters = Object.entries(dynamicFilters).every(
                ([key, selectedValues]) => {
                    if ((selectedValues as string[]).length === 0) return true;
                    if (key === "brand") return (selectedValues as string[]).includes(product.brand);
                    if (key === "category")
                        return (selectedValues as string[]).includes(product.category?.name || "");

                    return product.variants?.some((variant: any) =>
                        variant.specifications?.some(
                            (spec: any) =>
                                (spec.key === key || spec.name === key) &&
                                (selectedValues as string[]).includes(spec.value)
                        )
                    );
                }
            );

            return matchesPrice && matchesRating && matchesDynamicFilters;
        });

        // Sorting
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

        return filtered;
    }, [allProducts, selectedPriceRanges, dynamicFilters, minRating, sortBy]);

    const total = data?.getProductsByCategory?.total || initialProducts.length || 0;

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

    const displayTitle = formatUrlTitle(seoPage.urlPath);

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
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-4 text-left">
                                {displayTitle}
                            </h1>
                            <p className="text-muted-foreground max-w-3xl leading-relaxed text-sm text-left">
                                {seoPage.metaDescription || seoPage.category.description}
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <SortBar
                                sortBy={sortBy}
                                setSortBy={setSortBy}
                                showFilters={mobileFiltersOpen}
                                setShowFilters={setMobileFiltersOpen}
                                activeFiltersCount={
                                    Object.values(dynamicFilters).reduce((sum, v) => sum + (v as string[]).length, 0) +
                                    (minRating > 0 ? 1 : 0) +
                                    selectedPriceRanges.length
                                }
                                itemsPerPage={ITEMS_PER_PAGE}
                                setItemsPerPage={() => { }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ActiveFilters
                    dynamicFilters={dynamicFilters}
                    minRating={minRating}
                    toggleFilter={toggleDynamicFilter}
                    selectedPriceRanges={selectedPriceRanges}
                    togglePriceRange={togglePriceRange}
                    setMinRating={setMinRating}
                    clearFilters={resetFilters}
                    filterOptions={{}}
                    dynamicSearchData={{
                        category: seoPage.category.slug,
                        filters: dynamicSearchData?.filters || [],
                    }}
                />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-4">Filters</h3>
                                <FilterSidebar
                                    showFilters={true}
                                    selectedPriceRanges={selectedPriceRanges}
                                    togglePriceRange={togglePriceRange}
                                    minRating={minRating}
                                    setMinRating={setMinRating}
                                    dynamicFilters={dynamicFilters}
                                    toggleFilter={toggleDynamicFilter}
                                    filterOptions={{}}
                                    dynamicSearchData={{
                                        category: seoPage.category.slug,
                                        filters: dynamicSearchData?.filters || [],
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="lg:col-span-3">
                        <div className={`flex flex-col gap-6 transition-opacity duration-300 ${(loading && filteredProducts.length === 0) ? 'opacity-50' : 'opacity-100'}`}>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product: any) => (
                                    <ProductCard key={product.id} product={product} />
                                ))
                            ) : (
                                loading && [...Array(4)].map((_, i) => (
                                    <ProductCardSkeleton key={`skeleton-initial-${i}`} />
                                ))
                            )}

                            {!loading && hasMore && inView && filteredProducts.length > 0 && (
                                [...Array(4)].map((_, i) => (
                                    <ProductCardSkeleton key={`skeleton-more-${i}`} />
                                ))
                            )}
                        </div>

                        <div ref={ref} className="h-20 w-full flex items-center justify-center mt-12" />

                        {!loading && allProducts.length === 0 && !data?.getProductsByCategory?.products?.length && (
                            <div className="text-center py-24 flex flex-col items-center col-span-full">
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
            </div>
        </div>
    );
}
