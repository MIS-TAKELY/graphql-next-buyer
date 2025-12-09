// app/(main)/cateygory/[[...query]]/page.tsx
"use client";

import { useQuery } from "@apollo/client";
import { GET_PRODUCTS } from "@/client/product/product.queries";
import FilterSidebar from "@/components/filter/FilterSidebar";
import SortOptions from "@/components/filter/SortOptions";
import ProductCard from "@/components/page/home/ProductCard";
import { useState, useMemo } from "react";
import { IProducts } from "@/types/product";

export default function CategoryPage({ params }: { params: { query?: string[] } }) {
  // Parsing query params if needed for initial category selection
  // const categorySlug = params.query?.[0];

  const { data, loading, error } = useQuery(GET_PRODUCTS);
  const [filters, setFilters] = useState<any>({
    priceRange: [0, 200000],
    brands: [],
    minRating: null,
  });
  const [sortBy, setSortBy] = useState("featured");

  const products = data?.getProducts || [];

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Price
    result = result.filter(
      (p: any) => {
        // Assuming price is available on the first variant or directly on product (depends on schema)
        // Checking schema: Product has variants. Variants have price.
        // Let's safe check variants.
        const price = parseFloat(p.variants?.[0]?.price || "0");
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      }
    );

    // Filter by Brand
    if (filters.brands.length > 0) {
      result = result.filter((p: any) => filters.brands.includes(p.brand?.name || "")); // Assuming brand is a string or object
      // wait, schema said `brand: String` in Product model but also `brand: IBrand` in types.
      // let's check GET_PRODUCTS query again.
    }

    // Filter by Rating
    if (filters.minRating) {
      result = result.filter((p: any) => {
        const avgRating = p.reviews?.reduce((sum: number, r: any) => sum + r.rating, 0) / (p.reviews?.length || 1) || 0;
        return avgRating >= filters.minRating;
      });
    }

    // Sort
    if (sortBy === "price-low") {
      result.sort((a: any, b: any) => parseFloat(a.variants?.[0]?.price || "0") - parseFloat(b.variants?.[0]?.price || "0"));
    } else if (sortBy === "price-high") {
      result.sort((a: any, b: any) => parseFloat(b.variants?.[0]?.price || "0") - parseFloat(a.variants?.[0]?.price || "0"));
    } else if (sortBy === "rating") {
      result.sort((a: any, b: any) => {
        const ratingA = a.reviews?.reduce((sum: number, r: any) => sum + r.rating, 0) / (a.reviews?.length || 1) || 0;
        const ratingB = b.reviews?.reduce((sum: number, r: any) => sum + r.rating, 0) / (b.reviews?.length || 1) || 0;
        return ratingB - ratingA;
      });
    }

    return result;
  }, [products, filters, sortBy]);

  if (loading) return <div className="container-custom py-8">Loading products...</div>;
  if (error) return <div className="container-custom py-8">Error loading products</div>;

  return (
    <div className="container-custom py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-1/4">
          <FilterSidebar onFilterChange={setFilters} />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">All Products ({filteredProducts.length})</h1>
            <SortOptions onSortChange={setSortBy} />
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product: IProducts) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No products found matching your filters.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
