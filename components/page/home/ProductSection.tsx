import React from "react";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { IProducts } from "@/types/product";
import ProductCard from "./ProductCard";

interface ProductSectionProps {
  name: string;
  products?: IProducts[];
  loading?: boolean;
  count?: number;
  layout?: "grid" | "horizontal";
}

const SKELETON_ARRAYS = {
  6: Array.from({ length: 6 }, (_, i) => i),
  8: Array.from({ length: 8 }, (_, i) => i),
} as const;

function ProductSection({
  name,
  products,
  loading = false,
  count = 6,
  layout = "grid",
}: ProductSectionProps) {
  const skeletonArray =
    SKELETON_ARRAYS[count as keyof typeof SKELETON_ARRAYS] ||
    SKELETON_ARRAYS[6];
  const containerClass =
    layout === "horizontal"
      ? "flex gap-3 sm:gap-4 overflow-x-auto pb-4 horizontal-scroll"
      : "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 md:gap-6";
  const itemClass =
    layout === "horizontal" ? "flex-none w-48 sm:w-56 md:w-64" : "";

  if (loading && !products) {
    return (
      <section className="mb-8 md:mb-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-1">
          {name}
        </h2>
        <div className={containerClass}>
          {skeletonArray.map((i) => (
            <div key={i} className={itemClass}>
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="mb-8 md:mb-12">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-1">
        {name}
      </h2>
      <div className={containerClass}>
        {products.map((product) => (
          <div key={product.id} className={itemClass}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
export default React.memo(ProductSection);