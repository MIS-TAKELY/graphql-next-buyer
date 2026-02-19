"use client";
import { TProduct } from "@/types/product";
import ProductCard from "./ProductCard";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 0);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        scrollContainer.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [displayProducts]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (displayProducts.length === 0) return null;

  return (
    <section className="mb-8 md:mb-12 bg-card w-full shadow-sm py-6 md:py-8">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {name}
          </h2>
          {layout === "horizontal" && (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                disabled={!showLeft}
                className="p-2 rounded-full border bg-background hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!showRight}
                className="p-2 rounded-full border bg-background hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        <div className="relative">
          <div
            ref={scrollRef}
            className={
              layout === "horizontal"
                ? "flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 justify-items-center"
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
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
