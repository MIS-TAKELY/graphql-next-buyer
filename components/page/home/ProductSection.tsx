"use client";
import { IProducts } from "@/types/product";
import React from "react";
import ProductCard from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

interface ProductSectionProps {
  name: string;
  products?: IProducts[];
  loading?: boolean;
  count?: number;
  layout?: "grid" | "horizontal";
}

const SKELETON_ARRAYS = {
  6: Array.from({ length: 6 }),
  8: Array.from({ length: 8 }),
} as const;

function ProductSection({
  name,
  products,
  loading = false,
  count = 6,
  layout = "grid",
}: ProductSectionProps) {
  const skeletonArray = SKELETON_ARRAYS[count as keyof typeof SKELETON_ARRAYS] || SKELETON_ARRAYS[6];

  const containerClass =
    layout === "horizontal"
      ? "flex gap-3 xs:gap-4 sm:gap-5 md:gap-6 overflow-x-auto pb-4 sm:pb-6 horizontal-scroll scrollbar-hide"
      : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 laptop-14:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-5";

  const itemClass = layout === "horizontal" ? "flex-none w-40 xs:w-48 sm:w-56 md:w-64 lg:w-72" : "";

  return (
    <section className="mb-4 xs:mb-6 sm:mb-8 md:mb-10">
      <h2 className="text-lg xs:text-xl sm:text-2xl font-semibold mb-2 xs:mb-3 sm:mb-5 px-1 text-foreground">
        {name}
      </h2>
      <div className={containerClass}>
        {loading && !products
          ? skeletonArray.map((_, i) => (
              <div key={i} className={itemClass}>
                <ProductCardSkeleton />
              </div>
            ))
          : products?.slice(0, count).map((product) => (
              <div key={product.id} className={itemClass}>
                <ProductCard product={product} />
              </div>
            ))}
      </div>
    </section>
  );
}

export default React.memo(ProductSection);
