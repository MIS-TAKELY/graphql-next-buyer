"use client";
import { TProduct } from "@/types/product";
import ProductCard from "./ProductCard";

interface ProductSectionProps {
  name: string;
  products: TProduct[];
  count: number;
  layout: "grid" | "horizontal";
}

export default function ProductSection({
  name,
  products,
  count,
  layout,
}: ProductSectionProps) {
  const displayProducts = products.slice(0, count);

  if (displayProducts.length === 0) return null;

  return (
    <section className="mb-8 md:mb-12">
      <div className="container-custom">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground">
          {name}
        </h2>
        <div
          className={
            layout === "horizontal"
              ? "flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide"
              : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 justify-items-center"
          }
        >
          {displayProducts.map((product, index) => (
            <div
              key={product.id}
              className={
                layout === "horizontal"
                  ? "flex-none w-[220px]"
                  : "w-full flex justify-center"
              }
            >
              <ProductCard
                product={product}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
