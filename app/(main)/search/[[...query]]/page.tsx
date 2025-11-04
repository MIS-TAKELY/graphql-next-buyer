"use client";

import ActiveFilters from "@/components/search/ActiveFilters";
import FilterSidebar from "@/components/search/FilterSidebar";
import Pagination from "@/components/search/Pagination";
import ProductGrid from "@/components/search/ProductGrid";
import SearchHeader from "@/components/search/SearchHeader";
import SortBar from "@/components/search/SortBar";
import { useDynamicSearchFilter } from "@/hooks/dynamicSeaarchFilter/useDynamicSearchFilter";
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
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [dynamicFilters, setDynamicFilters] = useState<{
    [key: string]: string[];
  }>({});
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("relevance");

  // Build filter options directly from API response
  const filterOptions = useMemo(() => {
    const options: { [key: string]: string[] } = {};
    
    dynamicSearchData?.filters?.forEach((filter) => {
      if (filter.options && filter.options.length > 0) {
        options[filter.key] = filter.options;
      }
    });
    
    return options;
  }, [dynamicSearchData]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(searchProducts)) return [];

    let filtered = searchProducts.filter((product: SearchProduct) => {
      // Price filter
      const price = product.variants[0]?.price || 0;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

      // Rating filter
      const rating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
            product.reviews.length
          : 0;
      const matchesRating = rating >= minRating;

      // Dynamic filters (brand, category, specs)
      const matchesDynamicFilters = Object.entries(dynamicFilters).every(
        ([key, selectedValues]) => {
          if (selectedValues.length === 0) return true;

          // Brand filter
          if (key === "brand") {
            return selectedValues.includes(product.brand);
          }

          // Category filter
          if (key === "category") {
            return selectedValues.includes(product.category.name);
          }

          // Specification-based filters (RAM, storage, etc.)
          // Since specs only have 'value' field, match against any spec value
          return product.variants.some((variant) =>
            variant.specifications.some((spec) =>
              selectedValues.includes(spec.value)
            )
          );
        }
      );

      return matchesPrice && matchesRating && matchesDynamicFilters;
    });

    // Sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => 
          (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0)
        );
        break;
      case "price-high":
        filtered.sort((a, b) => 
          (b.variants[0]?.price || 0) - (a.variants[0]?.price || 0)
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
  }, [searchProducts, priceRange, dynamicFilters, minRating, sortBy]);

  const toggleFilter = (key: string, value: string) => {
    setDynamicFilters((prev) => {
      const currentValues = prev[key] || [];
      return currentValues.includes(value)
        ? { ...prev, [key]: currentValues.filter((v) => v !== value) }
        : { ...prev, [key]: [...currentValues, value] };
    });
  };

  const clearFilters = () => {
    setPriceRange([0, 100000]);
    setDynamicFilters({});
    setMinRating(0);
  };

  const activeFiltersCount =
    Object.values(dynamicFilters).reduce((sum, v) => sum + v.length, 0) +
    (minRating > 0 ? 1 : 0) +
    (priceRange[0] !== 0 || priceRange[1] !== 100000 ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SearchHeader
          query={query}
          filteredCount={filteredProducts.length}
          totalResults={totalResults}
        />

        <ActiveFilters
          dynamicFilters={dynamicFilters}
          minRating={minRating}
          toggleFilter={toggleFilter}
          setMinRating={setMinRating}
          clearFilters={clearFilters}
          filterOptions={filterOptions}
          dynamicSearchData={dynamicSearchData}
        />

        <SortBar
          sortBy={sortBy}
          setSortBy={setSortBy}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          activeFiltersCount={activeFiltersCount}
        />

        <div className="flex gap-6">
          <FilterSidebar
            showFilters={showFilters}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            minRating={minRating}
            setMinRating={setMinRating}
            dynamicFilters={dynamicFilters}
            toggleFilter={toggleFilter}
            filterOptions={filterOptions}
            dynamicSearchData={dynamicSearchData}
          />

          <ProductGrid
            products={filteredProducts}
            loading={searchLoading}
            clearFilters={clearFilters}
          />
        </div>

        <Pagination
          filteredCount={filteredProducts.length}
          totalResults={totalResults}
        />
      </div>
    </div>
  );
}