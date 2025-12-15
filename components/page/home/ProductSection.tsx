"use client";
import { IProducts } from "@/types/product";
import ProductCard from "./ProductCard";

interface ProductSectionProps {
  name: string;
  products: IProducts[];
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
      <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground">
          {name}
        </h2>
        <div
          className={
            layout === "horizontal"
              ? "flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide"
              : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4"
          }
        >
          {displayProducts.map((product, index) => (
            <div
              key={product.id}
              className={
                layout === "horizontal"
                  ? "flex-none w-[160px] sm:w-[200px]"
                  : ""
              }
            >
              <ProductCard
                product={product}
                priority={index < 4}
                sizes={
                  layout === "horizontal"
                    ? "200px"
                    : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, (max-width: 1536px) 20vw, 16vw"
                }
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
