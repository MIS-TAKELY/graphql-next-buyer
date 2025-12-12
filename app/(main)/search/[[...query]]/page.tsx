"use client";
import { useProductStore } from '@/store/productStore';
import ActiveFilters from "@/components/search/ActiveFilters";
import FilterSidebar from "@/components/search/FilterSidebar";
import Pagination from "@/components/search/Pagination";
import ProductGrid from "@/components/search/ProductGrid";
import SearchHeader from "@/components/search/SearchHeader";
import SortBar from "@/components/search/SortBar";
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
const totalResults = 10677;

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { searchProducts, searchLoading } = useSearch(query);
  const { dynamicSearchData } = useDynamicSearchFilter(query);
  const [showFilters, setShowFilters] = useState(false);

  // Zustand Store
  const {
    filters,
    toggleDynamicFilter,
    setPriceRange,
    setMinRating,
    setFilters,
    resetFilters
  } = useProductStore();

  const { priceRange, dynamicFilters, minRating, sort: sortBy } = filters;

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
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
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
  }, [searchProducts, priceRange, dynamicFilters, minRating, sortBy]);

  const toggleFilter = toggleDynamicFilter;

  const clearFilters = () => {
    resetFilters();
  };

  const activeFiltersCount =
    Object.values(dynamicFilters).reduce((sum, v) => sum + v.length, 0) +
    (minRating > 0 ? 1 : 0) +
    (priceRange[0] !== 0 || priceRange[1] !== 100000 ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
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
            />
          </div>
        </div>
        <div className="flex flex-col lg:flex-row lg:gap-4">
          {/* Mobile overlay sidebar */}
          <div
            className={`fixed top-52 inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 transform ${showFilters ? "translate-x-0" : "-translate-x-full"
              } lg:hidden transition-transform duration-300 ease-in-out z-50 overflow-y-auto p-4`}
          >
            <FilterSidebar
              showFilters={true} // Always show content when this div is visible
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              minRating={minRating}
              setMinRating={setMinRating}
              dynamicFilters={dynamicFilters}
              toggleFilter={toggleFilter}
              filterOptions={filterOptions}
              dynamicSearchData={dynamicSearchData}
            />
          </div>

          {/* Desktop sticky sidebar */}
          <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
            <div className="sticky top-20">
              {" "}
              {/* Adjust top value as needed */}
              <FilterSidebar
                showFilters={true}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                minRating={minRating}
                setMinRating={setMinRating}
                dynamicFilters={dynamicFilters}
                toggleFilter={toggleFilter}
                filterOptions={filterOptions}
                dynamicSearchData={dynamicSearchData}
              />
            </div>
          </div>

          {/* Overlay for mobile */}
          {showFilters && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setShowFilters(false)}
            ></div>
          )}

          {/* Main content */}
          <main className="flex-1">
            <ActiveFilters
              dynamicFilters={dynamicFilters}
              minRating={minRating}
              toggleFilter={toggleFilter}
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
              filteredCount={filteredProducts.length}
              totalResults={totalResults}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
