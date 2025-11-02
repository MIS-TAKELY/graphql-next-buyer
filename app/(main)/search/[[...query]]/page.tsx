"use client";
import ActiveFilters from "@/components/search/ActiveFilters";
import FilterSidebar from "@/components/search/FilterSidebar";
import Pagination from "@/components/search/Pagination";
import ProductGrid from "@/components/search/ProductGrid";
import SearchHeader from "@/components/search/SearchHeader";
import SortBar from "@/components/search/SortBar";
import { useSearch } from "@/hooks/search/useSearch";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Specification {
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
}

const categories = [
  "Mobiles & Accessories",
  "Electronics",
  "Clothing",
  "Toys",
  "Fitness",
  "Personal Care",
  "Automotive",
];
const brands = [
  "Apple",
  "Google",
  "MOTOROLA",
  "vivo",
  "OPPO",
  "Infinix",
  "Canon",
  "Nike",
  "Pantene",
  "Marvel",
];
const networks = ["5G", "4G", "3G", "2G"];
const totalResults = 10677;

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { searchProducts, searchLoading } = useSearch(query);

  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("relevance");
  const [filteredProducts, setFilteredProducts] = useState<SearchProduct[]>([]);

  useEffect(() => {
    if (Array.isArray(searchProducts)) {
      const transformedProducts: SearchProduct[] = searchProducts.map((product, index) => ({
        name: (product.name),
        variants: product.variants.map((variant: any) => ({
          price: variant.price || 0,
          mrp: variant.mrp || variant.price || 0,
          specifications: variant.specifications.map((spec: any) => ({
            value: spec.value,
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
        category: { name: product.category.name },
      }));

      // Apply filtering
      let filtered = transformedProducts.filter((product) => {
        const price = product.variants[0]?.price || 0;
        const rating =
          product.reviews.length > 0
            ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
              product.reviews.length
            : 0;
        const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
        const matchesCategory =
          selectedCategories.length === 0 ||
          selectedCategories.includes(product.category.name);
        const matchesBrand =
          selectedBrands.length === 0 || selectedBrands.includes(product.brand);
        const matchesNetwork = selectedNetworks.length === 0; // Network not available
        const matchesRating = rating >= minRating;

        return matchesPrice && matchesCategory && matchesBrand && matchesNetwork && matchesRating;
      });

      // Apply sorting
      if (sortBy === "price-low") {
        filtered.sort((a, b) => (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0));
      } else if (sortBy === "price-high") {
        filtered.sort((a, b) => (b.variants[0]?.price || 0) - (a.variants[0]?.price || 0));
      } else if (sortBy === "rating") {
        filtered.sort((a, b) => {
          const aRating =
            a.reviews.length > 0
              ? a.reviews.reduce((sum, review) => sum + review.rating, 0) / a.reviews.length
              : 0;
          const bRating =
            b.reviews.length > 0
              ? b.reviews.reduce((sum, review) => sum + review.rating, 0) / b.reviews.length
              : 0;
          return bRating - aRating;
        });
      } else if (sortBy === "popularity") {
        filtered.sort((a, b) => b.reviews.length - a.reviews.length);
      }
      // Omit sorting by "newest" since publishedDate is not available

      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [
    searchProducts,
    priceRange,
    selectedCategories,
    selectedBrands,
    selectedNetworks,
    minRating,
    sortBy,
  ]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleNetwork = (network: string) => {
    setSelectedNetworks((prev) =>
      prev.includes(network) ? prev.filter((n) => n !== network) : [...prev, network]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 100000]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedNetworks([]);
    setMinRating(0);
  };

  const activeFiltersCount =
    selectedCategories.length +
    selectedBrands.length +
    selectedNetworks.length +
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
          selectedCategories={selectedCategories}
          selectedBrands={selectedBrands}
          selectedNetworks={selectedNetworks}
          minRating={minRating}
          toggleCategory={toggleCategory}
          toggleBrand={toggleBrand}
          toggleNetwork={toggleNetwork}
          setMinRating={setMinRating}
          clearFilters={clearFilters}
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
            toggleCategory={toggleCategory}
            selectedBrands={selectedBrands}
            toggleBrand={toggleBrand}
            selectedNetworks={selectedNetworks}
            toggleNetwork={toggleNetwork}
            minRating={minRating}
            setMinRating={setMinRating}
            categories={categories}
            brands={brands}
            networks={networks}
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