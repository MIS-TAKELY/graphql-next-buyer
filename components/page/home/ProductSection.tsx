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
      : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6";

  const itemClass = layout === "horizontal" ? "flex-none w-40 xs:w-48 sm:w-56 md:w-64 lg:w-72" : "";

  return (
    <section className="mb-8 xs:mb-10 sm:mb-12 md:mb-16">
      <div className="container-custom">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-foreground tracking-tight">
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
      </div>
    </section>
  );
}

export default React.memo(ProductSection);
