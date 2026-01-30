"use client";

import { useQuery } from "@apollo/client";
import { GET_PRODUCTS_BY_CATEGORY } from "@/client/category/category.queries";
import ProductCard from "@/components/search/ProductCard";
import ProductCardSkeleton from "@/components/search/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Filter, Package, Star, X } from "lucide-react";
import Link from "next/link";

interface CategoryPageClientProps {
  params: { query?: string[] };
}

export default function CategoryPageClient({ params }: CategoryPageClientProps) {
  const categorySlug = params.query?.[params.query.length - 1] || "";

  const { data, loading, error } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: { categorySlug, limit: 100, offset: 0 },
    skip: !categorySlug,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("featured");

  const products = data?.getProductsByCategory?.products || [];
  const category = data?.getProductsByCategory?.category;
  const total = data?.getProductsByCategory?.total || 0;

  // Extract unique brands from products
  const brands = useMemo(() => {
    const brandSet = new Set<string>();
    products.forEach((p: any) => {
      if (p.brand) brandSet.add(p.brand);
    });
    return Array.from(brandSet).sort();
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by price
    result = result.filter((p: any) => {
      const price = parseFloat(p.variants?.[0]?.price || "0");
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Filter by brand
    if (selectedBrands.length > 0) {
      result = result.filter((p: any) => selectedBrands.includes(p.brand));
    }

    // Filter by rating
    if (minRating > 0) {
      result = result.filter((p: any) => {
        const avgRating =
          p.reviews?.length > 0
            ? p.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / p.reviews.length
            : 0;
        return avgRating >= minRating;
      });
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a: any, b: any) => 
          parseFloat(a.variants?.[0]?.price || "0") - parseFloat(b.variants?.[0]?.price || "0")
        );
        break;
      case "price-high":
        result.sort((a: any, b: any) => 
          parseFloat(b.variants?.[0]?.price || "0") - parseFloat(a.variants?.[0]?.price || "0")
        );
        break;
      case "rating":
        result.sort((a: any, b: any) => {
          const ratingA = a.reviews?.length > 0
            ? a.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / a.reviews.length
            : 0;
          const ratingB = b.reviews?.length > 0
            ? b.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / b.reviews.length
            : 0;
          return ratingB - ratingA;
        });
        break;
      case "newest":
        result.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return result;
  }, [products, priceRange, selectedBrands, minRating, sortBy]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 500000]);
    setSelectedBrands([]);
    setMinRating(0);
  };

  const activeFiltersCount =
    (priceRange[0] > 0 || priceRange[1] < 500000 ? 1 : 0) +
    selectedBrands.length +
    (minRating > 0 ? 1 : 0);

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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">No Category Selected</h1>
          <p className="text-muted-foreground mb-4">Please select a category to browse products.</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-4">
          <div>
            <nav className="text-sm text-muted-foreground mb-1">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground font-medium">{category?.name || categorySlug}</span>
            </nav>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {category?.name || categorySlug}
            </h1>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${filteredProducts.length} of ${total} products`}
            </p>
          </div>

          {/* Sort & Filter Controls */}
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              className="lg:hidden flex items-center gap-2"
              onClick={() => setShowFilters(true)}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Mobile Filter Sidebar */}
          <div
            className={`fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-900 transform ${
              showFilters ? "translate-x-0" : "-translate-x-full"
            } lg:hidden transition-transform duration-300 ease-in-out z-50 overflow-y-auto shadow-2xl`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterContent
                brands={brands}
                selectedBrands={selectedBrands}
                toggleBrand={toggleBrand}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                minRating={minRating}
                setMinRating={setMinRating}
              />
              <div className="mt-6 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button className="flex-1" onClick={() => setShowFilters(false)}>
                  Apply
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Filters</h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <FilterContent
                brands={brands}
                selectedBrands={selectedBrands}
                toggleBrand={toggleBrand}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                minRating={minRating}
                setMinRating={setMinRating}
              />
            </div>
          </aside>

          {/* Backdrop for mobile filter */}
          {showFilters && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setShowFilters(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1">
            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedBrands.map(brand => (
                  <span
                    key={brand}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                  >
                    {brand}
                    <button onClick={() => toggleBrand(brand)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {minRating > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {minRating}+ Stars
                    <button onClick={() => setMinRating(0)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 500000) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    Rs. {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()}
                    <button onClick={() => setPriceRange([0, 500000])}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Product Grid */}
            {loading ? (
              <div className="flex flex-col gap-4">
                {[...Array(6)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-2">Error loading products</p>
                <p className="text-muted-foreground text-sm">{error.message}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-base font-medium mb-2">No products found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Try adjusting your filters
                </p>
                <Button onClick={clearFilters} variant="outline" size="sm">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// Filter Content Component
function FilterContent({
  brands,
  selectedBrands,
  toggleBrand,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
}: {
  brands: string[];
  selectedBrands: string[];
  toggleBrand: (brand: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
}) {
  const [showAllBrands, setShowAllBrands] = useState(false);
  const displayedBrands = showAllBrands ? brands : brands.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h3 className="font-medium text-sm mb-3">Price Range</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            max={500000}
            step={1000}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Rs. {priceRange[0].toLocaleString()}</span>
            <span>Rs. {priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h3 className="font-medium text-sm mb-3">Customer Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <div
              key={rating}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                minRating === rating
                  ? "bg-primary/10"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => setMinRating(minRating === rating ? 0 : rating)}
            >
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm">& Up</span>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      {brands.length > 0 && (
        <div>
          <h3 className="font-medium text-sm mb-3">Brand</h3>
          <div className="space-y-2">
            {displayedBrands.map((brand) => (
              <div
                key={brand}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded"
                onClick={() => toggleBrand(brand)}
              >
                <Checkbox
                  id={`brand-${brand}`}
                  checked={selectedBrands.includes(brand)}
                  className="h-4 w-4"
                />
                <Label
                  htmlFor={`brand-${brand}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {brand}
                </Label>
              </div>
            ))}
            {brands.length > 5 && (
              <button
                onClick={() => setShowAllBrands(!showAllBrands)}
                className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
              >
                {showAllBrands ? (
                  <>
                    Show Less <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    Show {brands.length - 5} More <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
