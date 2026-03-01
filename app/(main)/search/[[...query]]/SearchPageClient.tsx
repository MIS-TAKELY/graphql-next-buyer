"use client";
import { useProductStore } from '@/store/productStore';
import ActiveFilters from "@/components/search/ActiveFilters";
import FilterSidebar from "@/components/search/FilterSidebar";
import ProductGrid from "@/components/search/ProductGrid";
import SearchHeader from "@/components/search/SearchHeader";
import SortBar from "@/components/search/SortBar";
import { useDynamicSearchFilter } from "@/hooks/dynamicSearchFilter/useDynamicSearchFilter";
import { useSearch } from "@/hooks/search/useSearch";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

interface Specification {
  key?: string;
  name?: string;
  value: string;
  __typename?: string;
}
interface Variant {
  price: number;
  mrp: number;
  specifications: Specification[];
}
interface Image {
  altText: string;
  url: string;
}
interface Review {
  rating: number;
}
interface Category {
  name: string;
}
interface SearchProduct {
  name: string;
  variants: Variant[];
  images: Image[];
  reviews: Review[];
  description: string;
  brand: string;
  slug: string;
  category: Category;
  deliveryOptions?: { title: string }[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { dynamicSearchData } = useDynamicSearchFilter(query);
  const [showFilters, setShowFilters] = useState(false);

  // Zustand Store
  const {
    filters: storeFilters,
    toggleDynamicFilter,
    togglePriceRange,
    setMinRating,
    setFilters,
    resetFilters,
  } = useProductStore();

  const formattedFilters = useMemo(() => {
    // Convert store filters to SearchFilters input format
    return {
      brands: storeFilters.dynamicFilters["brand"] || [],
      categories: storeFilters.categories,
      minPrice: storeFilters.selectedPriceRanges.length > 0
        ? Math.min(...storeFilters.selectedPriceRanges.map(r => parseInt(r) || 0))
        : undefined,
      maxPrice: storeFilters.selectedPriceRanges.length > 0
        ? Math.max(...storeFilters.selectedPriceRanges.map(r => r.endsWith('+') ? 10000000 : parseInt(r.split('-')[1]) || 10000000))
        : undefined,
      minRating: storeFilters.minRating,
      specifications: storeFilters.dynamicFilters,
    };
  }, [storeFilters]);

  const {
    searchProducts,
    backendFilters,
    searchLoading,
    isFetchingMore,
    page,
    setPage,
    totalPages,
    totalResults,
    limit,
    setLimit,
  } = useSearch(query, formattedFilters);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (inView && !searchLoading && !isFetchingMore && page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [inView, searchLoading, isFetchingMore, page, totalPages, setPage]);

  const {
    selectedPriceRanges,
    dynamicFilters,
    minRating,
    sort: sortBy,
  } = storeFilters;

  const setSortBy = (sort: string) => setFilters({ sort });

  // Process filters from backend (new FilterGroup structure)
  const { computedFilters: rawComputedFilters, filterOptions: rawFilterOptions } = useMemo(() => {
    const finalFilters: any[] = [];
    const options: { [key: string]: any[] } = {};
    const seenLabels = new Set<string>();

    const processFilter = (filter: any) => {
      const normalizedLabel = filter.label?.toLowerCase().trim();
      if (normalizedLabel && !seenLabels.has(normalizedLabel) && filter.options && filter.options.length > 0) {
        seenLabels.add(normalizedLabel);
        finalFilters.push({
          key: filter.key,
          label: filter.label,
          options: filter.options, // Already in { value, count } format
          type: filter.type || "dropdown",
        });
        options[filter.key] = filter.options;
      }
    };

    // Prioritize AI-driven filters from dynamicSearchData
    if (dynamicSearchData?.filters && dynamicSearchData.filters.length > 0) {
      dynamicSearchData.filters.forEach(processFilter);
    }

    // Process backend filters (new FilterGroup[] structure)
    if (backendFilters && Array.isArray(backendFilters)) {
      backendFilters.forEach(processFilter);
    }

    return { computedFilters: finalFilters, filterOptions: options };
  }, [backendFilters, dynamicSearchData]);

  // Persist filters to avoid layout shifts/disappearing sidebar during loading
  const [persistentFilters, setPersistentFilters] = useState<{
    computedFilters: any[];
    filterOptions: { [key: string]: any[] };
  }>({
    computedFilters: [],
    filterOptions: {},
  });

  useEffect(() => {
    if (rawComputedFilters.length > 0) {
      setPersistentFilters({
        computedFilters: rawComputedFilters,
        filterOptions: rawFilterOptions,
      });
    }
  }, [rawComputedFilters, rawFilterOptions]);

  const displayFilters =
    rawComputedFilters.length > 0
      ? rawComputedFilters
      : persistentFilters.computedFilters;
  const displayOptions =
    rawComputedFilters.length > 0
      ? rawFilterOptions
      : persistentFilters.filterOptions;

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(searchProducts)) return [];

    console.log(`🔍 Client filtering ${searchProducts.length} products from server`);

    const filtered = [...searchProducts].filter((product: SearchProduct) => {
      const price = product.variants[0]?.price || 0;

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
      const rating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          product.reviews.length
          : 0;
      const matchesRating = rating >= minRating;
      const matchesDynamicFilters = Object.entries(dynamicFilters).every(
        ([key, selectedValues]) => {
          if ((selectedValues as string[]).length === 0) return true;
          // Skip 'category' client-side — already handled server-side by Typesense.
          // Applying it client-side causes a race condition where the AI filter
          // returns a stale/wrong category and wipes out valid search results.
          if (key === "category") return true;
          if (key === "brand") return (selectedValues as string[]).includes(product.brand);
          if (key === "delivery_options")
            return product.deliveryOptions?.some((opt) =>
              (selectedValues as string[]).includes(opt.title)
            );
          return product.variants.some((variant) =>
            variant.specifications.some(
              (spec) =>
                (spec.key === key || spec.name === key) &&
                (selectedValues as string[]).includes(spec.value)
            )
          );
        }
      );
      return matchesPrice && matchesRating && matchesDynamicFilters;
    });

    console.log(`✅ Filtered to ${filtered.length} products after client-side filters`);

    switch (sortBy) {
      case "price-low":
        filtered.sort(
          (a, b) => (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0)
        );
        break;
      case "price-high":
        filtered.sort(
          (a, b) => (b.variants[0]?.price || 0) - (a.variants[0]?.price || 0)
        );
        break;
      case "rating":
        filtered.sort((a, b) => {
          const avgRating = (reviews: Review[]) =>
            reviews.length > 0
              ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
              : 0;
          return avgRating(b.reviews) - avgRating(a.reviews);
        });
        break;
      case "popularity":
        filtered.sort((a, b) => b.reviews.length - a.reviews.length);
        break;
    }
    return filtered;
  }, [searchProducts, selectedPriceRanges, dynamicFilters, minRating, sortBy]);

  const toggleFilter = toggleDynamicFilter;

  const clearFilters = () => {
    resetFilters();
  };

  const activeFiltersCount =
    Object.values(dynamicFilters).reduce((sum, v) => sum + (v as string[]).length, 0) +
    (minRating > 0 ? 1 : 0) +
    selectedPriceRanges.length;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
          <SearchHeader
            query={query}
            filteredCount={filteredProducts.length}
            totalResults={totalResults}
          />
          <div className="flex flex-col-reverse">
            <SortBar
              sortBy={sortBy}
              setSortBy={setSortBy}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              activeFiltersCount={activeFiltersCount}
              itemsPerPage={limit}
              setItemsPerPage={(val) => {
                setLimit(val);
                setPage(1);
              }}
            />
          </div>
        </div>
        <div className="flex flex-col lg:flex-row lg:gap-4">
          <div
            className={`fixed top-0 inset-y-0 left-0 w-80 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl transform ${showFilters ? "translate-x-0" : "-translate-x-full"
              } lg:hidden transition-transform duration-300 ease-in-out z-50 overflow-y-auto shadow-2xl rounded-r-2xl`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Filters
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close filters"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <FilterSidebar
                showFilters={true}
                selectedPriceRanges={selectedPriceRanges}
                togglePriceRange={togglePriceRange}
                minRating={minRating}
                setMinRating={setMinRating}
                dynamicFilters={dynamicFilters}
                toggleFilter={toggleFilter}
                filterOptions={displayOptions}
                dynamicSearchData={{
                  category: dynamicSearchData?.category || "",
                  intent: dynamicSearchData?.intent || {},
                  filters: displayFilters,
                }}
              />
            </div>
          </div>

          <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
            <div className="sticky top-20">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <FilterSidebar
                  showFilters={true}
                  selectedPriceRanges={selectedPriceRanges}
                  togglePriceRange={togglePriceRange}
                  minRating={minRating}
                  setMinRating={setMinRating}
                  dynamicFilters={dynamicFilters}
                  toggleFilter={toggleFilter}
                  filterOptions={displayOptions}
                  dynamicSearchData={{
                    category: dynamicSearchData?.category || "",
                    intent: dynamicSearchData?.intent || {},
                    filters: displayFilters,
                  }}
                />
              </div>
            </div>
          </div>

          {showFilters && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setShowFilters(false)}
            ></div>
          )}

          <main className="flex-1 mt-4 lg:mt-0">
            <ActiveFilters
              dynamicFilters={dynamicFilters}
              minRating={minRating}
              toggleFilter={toggleFilter}
              selectedPriceRanges={selectedPriceRanges}
              togglePriceRange={togglePriceRange}
              setMinRating={setMinRating}
              clearFilters={clearFilters}
              filterOptions={displayOptions}
              dynamicSearchData={{
                category: dynamicSearchData?.category || "",
                intent: dynamicSearchData?.intent || {},
                filters: displayFilters,
              }}
            />
            <ProductGrid
              products={filteredProducts}
              loading={searchLoading}
              isFetchingMore={isFetchingMore}
              clearFilters={clearFilters}
            />
            {page < totalPages && (
              <div ref={ref} className="h-20 flex items-center justify-center">
                {isFetchingMore && (
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}