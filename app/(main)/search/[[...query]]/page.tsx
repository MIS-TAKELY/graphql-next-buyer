// SearchPage.tsx
"use client";
import ActiveFilters from "@/components/search/ActiveFilters";
import FilterSidebar from "@/components/search/FilterSidebar";
import Pagination from "@/components/search/Pagination";
import ProductGrid from "@/components/search/ProductGrid";
import SearchHeader from "@/components/search/SearchHeader";
import SortBar from "@/components/search/SortBar";
import { Filter, useDynamicSearchFilter } from "@/hooks/dynamicSeaarchFilter/useDynamicSearchFilter";
import { useSearch } from "@/hooks/search/useSearch";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Specification {
  key: string;
  value: string;
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
  [key: string]: any;
}

const totalResults = 10677;

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const { searchProducts, searchLoading } = useSearch(query);
  const { dynamicSearchData, dynamicSearchFilterLoading } =
    useDynamicSearchFilter(query);

  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [dynamicFilters, setDynamicFilters] = useState<{ [key: string]: string[] }>({});
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("relevance");
  const [filteredProducts, setFilteredProducts] = useState<SearchProduct[]>([]);
  const [filterOptions, setFilterOptions] = useState<{ [key: string]: string[] }>({});

  // Build filter options dynamically from API and products
  useEffect(() => {
    const options: { [key: string]: string[] } = {};

    // Extract from dynamicSearchData (API-based)
    console.log("filyters-->",dynamicSearchData?.filters)
    if (dynamicSearchData?.filters) {
      dynamicSearchData.filters.forEach((filter:Filter) => {
        options[filter.key] = filter.options || [];
      });
    }

    // Extract categories dynamically from products
    if (Array.isArray(searchProducts)) {
      const categoryValues = new Set<string>();
      const brandValues = new Set<string>();

      searchProducts.forEach((product: SearchProduct) => {
        if (product.category?.name) categoryValues.add(product.category.name);
        if (product.brand) brandValues.add(product.brand);
      });

      if (categoryValues.size > 0)
        options["category"] = Array.from(categoryValues).sort();
      if (brandValues.size > 0)
        options["brand"] = Array.from(brandValues).sort();
    }

    setFilterOptions(options);
  }, [searchProducts, dynamicSearchData]);

  // Apply filtering logic
  useEffect(() => {
    if (Array.isArray(searchProducts)) {
      const transformedProducts: SearchProduct[] = searchProducts.map((product) => ({
        name: product.name,
        variants: product.variants.map((variant: any) => ({
          price: variant.price || 0,
          mrp: variant.mrp || variant.price || 0,
          specifications: variant.specifications.map((spec: any) => ({
            key: spec.key || "",
            value: spec.value || "",
          })),
        })),
        images: product.images.map((image: any) => ({
          altText: image.altText,
          url: image.url || "/placeholder-image.jpg",
        })),
        reviews: product.reviews.map((review: any) => ({
          rating: review.rating || 0,
        })),
        description: product.description,
        brand: product.brand,
        slug: product.slug,
        category: { name: product.category?.name },
      }));

      let filtered = transformedProducts.filter((product) => {
        const price = product.variants[0]?.price || 0;
        const rating =
          product.reviews.length > 0
            ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
              product.reviews.length
            : 0;

        const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
        const matchesRating = rating >= minRating;

        const matchesDynamicFilters = Object.keys(dynamicFilters).every((key) => {
          const selectedValues = dynamicFilters[key] || [];
          if (selectedValues.length === 0) return true;

          if (key === "brand") return selectedValues.includes(product.brand);
          if (key === "category") return selectedValues.includes(product.category.name);

          return product.variants.some((variant) =>
            variant.specifications.some(
              (spec) => spec.key === key && selectedValues.includes(spec.value)
            )
          );
        });

        return matchesPrice && matchesRating && matchesDynamicFilters;
      });

      // Sorting logic
      if (sortBy === "price-low")
        filtered.sort(
          (a, b) => (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0)
        );
      else if (sortBy === "price-high")
        filtered.sort(
          (a, b) => (b.variants[0]?.price || 0) - (a.variants[0]?.price || 0)
        );
      else if (sortBy === "rating")
        filtered.sort((a, b) => {
          const aRating =
            a.reviews.length > 0
              ? a.reviews.reduce((sum, r) => sum + r.rating, 0) / a.reviews.length
              : 0;
          const bRating =
            b.reviews.length > 0
              ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length
              : 0;
          return bRating - aRating;
        });
      else if (sortBy === "popularity")
        filtered.sort((a, b) => b.reviews.length - a.reviews.length);

      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
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

  const selectedCategories = dynamicFilters["category"] || [];
  const selectedBrands = dynamicFilters["brand"] || [];
  const categories = filterOptions["category"] || [];
  const brands = filterOptions["brand"] || [];

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
            selectedCategories={selectedCategories}
            toggleCategory={(c) => toggleFilter("category", c)}
            selectedBrands={selectedBrands}
            toggleBrand={(b) => toggleFilter("brand", b)}
            minRating={minRating}
            setMinRating={setMinRating}
            categories={categories}
            brands={brands}
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
