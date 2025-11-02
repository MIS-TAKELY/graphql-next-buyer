import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { NextRouter } from "next/router";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
import { Product } from "./SearchPage";

interface ProductGridProps {
  products: Product[];
  router: NextRouter;
  clearFilters: () => void;
  loading?: boolean;
}

export default function ProductGrid({
  products,
  router,
  clearFilters,
  loading = false,
}: ProductGridProps) {
  return (
    <main className="flex-1">
      {loading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : products?.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No products found
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your filters
          </p>
          <Button onClick={clearFilters} variant="outline">
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} router={router} />
          ))}
        </div>
      )}
    </main>
  );
}