"use client";
import ActiveFilters from "@/components/search/ActiveFilters";
import FilterSidebar from "@/components/search/FilterSidebar";
import Pagination from "@/components/search/Pagination";
import ProductGrid from "@/components/search/ProductGrid";
import SearchHeader from "@/components/search/SearchHeader";
import SortBar from "@/components/search/SortBar";
import { useSearch } from "@/hooks/search/useSearch";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Define types for product and filter data
interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  rating: number;
  ratings: number;
  reviews: number;
  category: string;
  brand: string;
  inStock: boolean;
  assured: boolean;
  specs: string[];
  stockInfo: string;
  stockColor: string;
  exchangeInfo: string;
  exchangeColor: string;
  network: string;
  publishedDate: string;
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
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const { searchProducts ,searchLoading} = useSearch(query);

  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("relevance");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Transform searchProducts to match Product interface
  useEffect(() => {
    if (Array.isArray(searchProducts)) {
      const transformedProducts: Product[] = searchProducts.map(
        (product, index) => {
          const variant = product.variants[0] || {
            price: 0,
            mrp: 0,
            specifications: [],
          };
          const price = variant.price || 0;
          const originalPrice = variant.mrp || price;
          const discount =
            originalPrice > price
              ? Math.round(((originalPrice - price) / originalPrice) * 100)
              : 0;

          // Infer category and brand based on product name

          return {
            id: index + 1, // Simple ID based on index
            name: product.name,
            price,
            originalPrice,
            discount,
            image: product.images[0]?.url || "/placeholder-image.jpg",
            rating: 0, // No rating data provided
            ratings: 0, // No ratings count provided
            reviews: product.reviews.length,
            description: product.description,
            category: product.category.name,
            brand: product.brand,
            inStock: true, // Default
            assured: false, // Default
            specs: variant.specifications.map(
              (spec: { value: string }) => spec.value
            ),
            slug:product.slug,
            stockInfo: "", // No stock info provided
            stockColor: "text-gray-500",
            exchangeInfo: "", // No exchange info provided
            exchangeColor: "text-gray-500",
            network: "", // Assume network for Apple Watch
            publishedDate: new Date().toISOString().split("T")[0], // Current date as fallback
          };
        }
      );

      // Apply filtering
      let filtered = transformedProducts.filter((product) => {
        const matchesPrice =
          product.price >= priceRange[0] && product.price <= priceRange[1];
        const matchesCategory =
          selectedCategories.length === 0 ||
          selectedCategories.includes(product.category);
        const matchesBrand =
          selectedBrands.length === 0 || selectedBrands.includes(product.brand);
        const matchesNetwork =
          selectedNetworks.length === 0 ||
          selectedNetworks.includes(product.network);
        const matchesRating = product.rating >= minRating;

        return (
          matchesPrice &&
          matchesCategory &&
          matchesBrand &&
          matchesNetwork &&
          matchesRating
        );
      });

      // Apply sorting
      if (sortBy === "price-low") {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === "price-high") {
        filtered.sort((a, b) => b.price - b.price);
      } else if (sortBy === "rating") {
        filtered.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === "popularity") {
        filtered.sort((a, b) => b.ratings - a.ratings);
      } else if (sortBy === "newest") {
        filtered.sort(
          (a, b) =>
            new Date(b.publishedDate).getTime() -
            new Date(a.publishedDate).getTime()
        );
      }

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
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleNetwork = (network: string) => {
    setSelectedNetworks((prev) =>
      prev.includes(network)
        ? prev.filter((n) => n !== network)
        : [...prev, network]
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
            router={router}
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
