"use client";
import { useProductStore } from '@/store/productStore';
import ActiveFilters from "@/components/search/ActiveFilters";
import FilterSidebar from "@/components/search/FilterSidebar";
import Pagination from "@/components/search/Pagination";
import ProductGrid from "@/components/search/ProductGrid";
import SearchHeader from "@/components/search/SearchHeader";
import SortBar from "@/components/search/SortBar";
import CompareButtonBar from "@/components/compare/CompareButtonBar";
import { Filter, useDynamicSearchFilter } from "@/hooks/dynamicSeaarchFilter/useDynamicSearchFilter";
import { useSearch } from "@/hooks/search/useSearch";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

interface Specification {
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
}


export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { searchProducts, searchLoading, page, setPage, totalPages, totalResults, limit, setLimit } = useSearch(query);
  const { dynamicSearchData } = useDynamicSearchFilter(query);
  const [showFilters, setShowFilters] = useState(false);

  // Zustand Store
  const {
    filters,
    toggleDynamicFilter,
    togglePriceRange,
    setMinRating,
    setFilters,
    resetFilters
  } = useProductStore();

  const { selectedPriceRanges, dynamicFilters, minRating, sort: sortBy } = filters;

  const setSortBy = (sort: string) => setFilters({ sort });

  // Sync query to store if needed, or handle initial hydration
  // For simplicity, we assume store is primary, but we might want to sync URL -> Store on mount
  // useEffect(() => {
  //   if (query && filters.searchQuery !== query) {
  //      setFilters({ searchQuery: query });
  //   }
  // }, [query, setFilters]);

  const filterOptions = useMemo(() => {
    const options: { [key: string]: string[] } = {};
    dynamicSearchData?.filters?.forEach((filter: Filter) => {
      if (filter.options && filter.options.length > 0) {
        options[filter.key] = filter.options;
      }
    });
    return options;
  }, [dynamicSearchData]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(searchProducts)) return [];
    let filtered = searchProducts.filter((product: SearchProduct) => {
      const price = product.variants[0]?.price || 0;

      const matchesPrice = selectedPriceRanges.length === 0 || selectedPriceRanges.some(range => {
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
          if (selectedValues.length === 0) return true;
          if (key === "brand") return selectedValues.includes(product.brand);
          if (key === "category")
            return selectedValues.includes(product.category.name);
          return product.variants.some((variant) =>
            variant.specifications.some((spec) =>
              selectedValues.includes(spec.value)
            )
          );
        }
      );
      return matchesPrice && matchesRating && matchesDynamicFilters;
    });
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
      // relevance typically default order
    }
    return filtered;
  }, [searchProducts, selectedPriceRanges, dynamicFilters, minRating, sortBy]);

  const toggleFilter = toggleDynamicFilter;

  const clearFilters = () => {
    resetFilters();
  };

  const activeFiltersCount =
    Object.values(dynamicFilters).reduce((sum, v) => sum + v.length, 0) +
    (minRating > 0 ? 1 : 0) +
    selectedPriceRanges.length;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:gap-4"> {/* Reduced gap-4 to gap-3 for tighter layout */}
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
          {/* Mobile overlay sidebar */}
          <div
            className={`fixed top-0 inset-y-0 left-0 w-80 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl transform ${showFilters ? "translate-x-0" : "-translate-x-full"} lg:hidden transition-transform duration-300 ease-in-out z-50 overflow-y-auto shadow-2xl rounded-r-2xl`}
          >
            <div className="p-6"> {/* Increased p-4 to p-6 for better touch spacing */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Filters</h2> {/* Increased text-lg to text-xl */}
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close filters"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> {/* Larger svg w-5 h-5 to w-6 h-6 */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <FilterSidebar
                showFilters={true} // Always show content when this div is visible
                selectedPriceRanges={selectedPriceRanges}
                togglePriceRange={togglePriceRange}
                minRating={minRating}
                setMinRating={setMinRating}
                dynamicFilters={dynamicFilters}
                toggleFilter={toggleFilter}
                filterOptions={filterOptions}
                dynamicSearchData={dynamicSearchData}
              />
            </div>
          </div>

          {/* Desktop sticky sidebar */}
          <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
            <div className="sticky top-20">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"> {/* rounded-lg to rounded-xl, p-4 to p-5 */}
                <FilterSidebar
                  showFilters={true}
                  selectedPriceRanges={selectedPriceRanges}
                  togglePriceRange={togglePriceRange}
                  minRating={minRating}
                  setMinRating={setMinRating}
                  dynamicFilters={dynamicFilters}
                  toggleFilter={toggleFilter}
                  filterOptions={filterOptions}
                  dynamicSearchData={dynamicSearchData}
                />
              </div>
            </div>
          </div>

          {/* Overlay for mobile */}
          {showFilters && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setShowFilters(false)}
            ></div>
          )}

          {/* Main content */}
          <main className="flex-1 mt-4 lg:mt-0"> {/* Added mt-4 for mobile spacing */}
            <ActiveFilters
              dynamicFilters={dynamicFilters}
              minRating={minRating}
              toggleFilter={toggleFilter}
              selectedPriceRanges={selectedPriceRanges}
              togglePriceRange={togglePriceRange}
              setMinRating={setMinRating}
              clearFilters={clearFilters}
              filterOptions={filterOptions}
              dynamicSearchData={dynamicSearchData}
            />
            <ProductGrid
              products={filteredProducts}
              loading={searchLoading}
              clearFilters={clearFilters}
            />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </main>
        </div>
      </div>

      {/* Comparison Button Bar - Floating */}
      <CompareButtonBar />
    </div>
  );
}