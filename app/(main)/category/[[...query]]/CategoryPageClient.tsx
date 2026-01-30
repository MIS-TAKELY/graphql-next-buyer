"use client";

import { useQuery } from "@apollo/client";
import { GET_PRODUCTS_BY_CATEGORY } from "@/client/category/category.queries";
import ProductCard from "@/components/search/ProductCard";
import ProductCardSkeleton from "@/components/search/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Package } from "lucide-react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";

interface CategoryPageClientProps {
  params: { query?: string[] };
}

const ITEMS_PER_PAGE = 20;

export default function CategoryPageClient({ params }: CategoryPageClientProps) {
  const categorySlug = params.query?.[params.query.length - 1] || "";

  console.log("CategoryPageClient mount/render with slug:", categorySlug);

  // State for accumulated products
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // Intersection Observer for infinite scroll
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  const { data, loading, error, fetchMore } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: {
      categorySlug,
      limit: ITEMS_PER_PAGE,
      offset: 0
    },
    skip: !categorySlug,
    notifyOnNetworkStatusChange: true,
  });

  // Effect to handle initial data load and resetting on slug change
  useEffect(() => {
    if (categorySlug) {
      setAllProducts([]);
      setHasMore(true);
      console.log("Resetting products for new slug:", categorySlug);
    }
  }, [categorySlug]);

  // Effect to populate initial data when it arrives
  useEffect(() => {
    if (data?.getProductsByCategory?.products && allProducts.length === 0) {
      const newProducts = data.getProductsByCategory.products;
      console.log(`Initial load: fetched ${newProducts.length} products`);
      setAllProducts(newProducts);
      setHasMore(newProducts.length >= ITEMS_PER_PAGE);
    }
  }, [data, allProducts.length]);

  // Handle Loading More
  const loadMore = useCallback(() => {
    if (loading || !hasMore || !categorySlug || allProducts.length === 0) return;

    const newOffset = allProducts.length;
    console.log(`Fetching more products... offset: ${newOffset}, slug: ${categorySlug}`);

    fetchMore({
      variables: {
        categorySlug,
        offset: newOffset,
        limit: ITEMS_PER_PAGE,
      },
    }).then((fetchMoreResult) => {
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
  }, [allProducts.length, fetchMore, hasMore, loading, categorySlug]);

  // Trigger load more when in view
  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMore();
    }
  }, [inView, hasMore, loading, loadMore]);

  const category = data?.getProductsByCategory?.category;
  const total = data?.getProductsByCategory?.total || 0;

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
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <nav className="text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium">{category?.name || categorySlug}</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            {category?.name || <span className="capitalize">{categorySlug.replace(/-/g, ' ')}</span>}
          </h1>

          {category?.description && (
            <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
              {category.description}
            </p>
          )}

          <div className="mt-6 text-sm font-medium text-muted-foreground">
            Showing {allProducts.length} of {total} products
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}

          {/* Skeleton Loaders for initial load or loading more */}
          {(loading || (hasMore && inView)) && (
            [...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={`skeleton-${i}`} />
            ))
          )}
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
    </div>
  );
}

