"use client";

import { useQuery } from "@apollo/client";
import { GET_PRODUCTS_BY_CATEGORY } from "@/client/category/category.queries";
import ProductCard from "@/components/page/home/ProductCard";
import { ProductCardSkeleton } from "@/components/page/home/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Package } from "lucide-react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import Breadcrumb from "@/components/page/product/Breadcrumb";
import SortBar from "@/components/search/SortBar";

interface CategoryPageClientProps {
  params: { query?: string[] };
}

const ITEMS_PER_PAGE = 20;

export default function CategoryPageClient({ params }: CategoryPageClientProps) {
  const rawSlug = params.query?.[params.query.length - 1] || "";
  // Decode URI components (e.g. %26 → &) to match DB slugs.
  // Case-insensitive matching is handled server-side in the resolver.
  const categorySlug = decodeURIComponent(rawSlug);

  // State for accumulated products
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // Intersection Observer for infinite scroll
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  // Track which slug the current data belongs to — prevents stale Apollo cached
  // data from a previously visited category from populating this category's products.
  const activeSlugRef = useRef(categorySlug);
  useEffect(() => {
    activeSlugRef.current = categorySlug;
  }, [categorySlug]);

  const { data, loading, error, fetchMore } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: {
      categorySlug,
      limit: ITEMS_PER_PAGE,
      offset: 0
    },
    skip: !categorySlug,
    notifyOnNetworkStatusChange: true,
    // Always fetch fresh on first load for a new slug — prevents stale cache bleeding
    fetchPolicy: 'cache-and-network',
  });

  const category = data?.getProductsByCategory?.category;
  const total = data?.getProductsByCategory?.total || 0;

  // Sort state
  const [sortBy, setSortBy] = useState("relevance");

  // Display Name logic (decoded for better UX)
  const displayName = category?.name || decodeURIComponent(categorySlug).replace(/-/g, ' ');

  // Effect to handle slug change: reset state immediately
  useEffect(() => {
    if (categorySlug) {
      setAllProducts([]);
      setHasMore(true);
    }
  }, [categorySlug]);

  // Populate products only when the returned data belongs to the CURRENT slug.
  // Without this guard, Apollo's cached results from previously visited categories
  // fire this effect (since allProducts resets to [] on slug change), polluting
  // the current page with wrong products.
  useEffect(() => {
    const returnedSlug = data?.getProductsByCategory?.category?.slug;
    const queryVarSlug = categorySlug;

    // Only accept data that belongs to the active slug
    if (
      data?.getProductsByCategory?.products &&
      allProducts.length === 0 &&
      // Guard: returned category slug must match current slug (case-insensitive)
      returnedSlug &&
      returnedSlug.toLowerCase() === queryVarSlug.toLowerCase()
    ) {
      const newProducts = data.getProductsByCategory.products;
      console.log(`Initial load: fetched ${newProducts.length} products for "${returnedSlug}"`);
      setAllProducts(newProducts);
      setHasMore(newProducts.length >= ITEMS_PER_PAGE);
    }
  }, [data, allProducts.length, categorySlug]);

  // Handle Loading More — reads slug from ref to ensure it's always current
  const loadMore = useCallback(() => {
    const currentSlug = activeSlugRef.current;
    if (loading || !hasMore || !currentSlug || allProducts.length === 0) return;

    const newOffset = allProducts.length;
    console.log(`Fetching more products... offset: ${newOffset}, slug: ${currentSlug}`);

    fetchMore({
      variables: {
        categorySlug: currentSlug,
        offset: newOffset,
        limit: ITEMS_PER_PAGE,
      },
    }).then((fetchMoreResult) => {
      // Double-check the slug is still current (user may have navigated away)
      if (activeSlugRef.current !== currentSlug) return;

      const newProducts = fetchMoreResult?.data?.getProductsByCategory?.products || [];
      console.log(`FetchMore: fetched ${newProducts.length} products`);

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
    }).catch(err => {
      console.error("fetchMore error:", err);
    });
  }, [allProducts.length, fetchMore, hasMore, loading]);

  // Trigger load more when in view
  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMore();
    }
  }, [inView, hasMore, loading, loadMore]);

  // Client side filtering and sorting
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(allProducts)) return [];

    let filtered = [...allProducts];

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
  }, [allProducts, sortBy]);

  // Breadcrumb JSON-LD
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: process.env.NEXT_PUBLIC_APP_URL || "https://vanijay.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category?.name || "Category",
        item: `${process.env.NEXT_PUBLIC_APP_URL || "https://vanijay.com"}/category/${categorySlug}`,
      },
    ],
  };

  if (!categorySlug) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">No Category Selected</h1>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Hero / Header Section */}
      <Breadcrumb
        category={category}
        name={displayName}
      />

      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight leading-none">
                <span className="capitalize">{displayName}</span>
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

            {/* Skeleton Loaders */}
            {(loading || (hasMore && inView)) && (
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
            We couldn't find any products in this category.
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
