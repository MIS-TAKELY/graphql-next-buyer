"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";
import { formatPrice } from "@/lib/utils";


interface ILandingPageProductGrid {
  title: string;
  data: any;
  error?: any;
  forceHorizontal?: boolean; // Force horizontal layout when needed
  categorySlug?: string;
}

const LandingPageProductGrid = ({
  title,
  data,
  error,
  forceHorizontal = false,
  categorySlug,
}: ILandingPageProductGrid) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => checkScrollability();

    checkScrollability();
    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", checkScrollability, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkScrollability);
    };
  }, [checkScrollability]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = 200;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (error) console.error(error);
  const deals = data?.getTopDealSaveUpTo?.slice(0, 4) || [];

  return (
    <div className="w-full">
      <div className="rounded-lg overflow-hidden bg-card h-full lg:border lg:border-border">
        {/* Header */}
        <div className="flex justify-between items-center bg-gradient-to-r from-card to-card/95 px-3 sm:px-4">
          <Link
            href={categorySlug ? `/category/${categorySlug}` : `/search?q=${encodeURIComponent(title)}`}
            className="text-lg py-4 sm:text-xl md:text-2xl font-bold text-card-foreground tracking-tight hover:text-primary transition-colors"
          >
            {title}
          </Link>
        </div>

        {/* Desktop View (≥1366px): 2x2 Grid */}
        <div className="hidden xl:block p-3">
          <div className="grid grid-cols-2 gap-3">
            {deals.map((deal: any, index: number) => (
              <Link
                key={index}
                href={deal?.category?.slug ? `/category/${deal.category.slug}` : `/search?q=${encodeURIComponent(deal?.name || "")}`}
                className="group flex flex-col rounded-lg overflow-hidden
                  border border-border bg-card/50
                  hover:border-primary/40 hover:shadow-md transition-all duration-300 hover:no-underline"
              >
                <div className="relative w-full aspect-square overflow-hidden bg-muted">
                  <Image
                    src={deal?.imageUrl || "/placeholder.svg"}
                    alt={deal?.imageAltText || "Product"}
                    fill
                    sizes="200px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    unoptimized
                  />
                </div>
                <div className="p-3 space-y-1.5">
                  <div className="font-semibold text-sm text-card-foreground line-clamp-2 min-h-[2.5rem]">
                    {deal?.name}
                  </div>
                  <div className="text-sm text-price font-bold bg-price/10 px-2 py-1 rounded inline-block">
                    Save up to {formatPrice(deal?.saveUpTo)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Tablet / Medium View (below 1366px): Horizontal Scroll */}
        <div
          className={`hidden ${forceHorizontal ? "lg:block xl:hidden" : "sm:block"
            } xl:hidden p-3`}
        >
          <div className="relative">
            {/* Left scroll button */}
            {canScrollLeft && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  scroll("left");
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card/95 backdrop-blur-sm 
                  p-2 shadow-lg border border-border rounded-full hover:bg-primary/10 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronRight className="rotate-180 h-5 w-5" />
              </button>
            )}

            {/* Right scroll button */}
            {canScrollRight && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  scroll("right");
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card/95 backdrop-blur-sm 
                  p-2 shadow-lg border border-border rounded-full hover:bg-primary/10 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            {/* Scrollable container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {deals.map((deal: any, index: number) => (
                <Link
                  key={index}
                  href={deal?.category?.slug ? `/category/${deal.category.slug}` : `/search?q=${encodeURIComponent(deal?.name || "")}`}
                  className="flex-shrink-0 group flex flex-col rounded-lg overflow-hidden
                    border border-border bg-card/50 w-44 sm:w-48 md:w-52
                    hover:border-primary/40 hover:shadow-md transition-all duration-300 hover:no-underline"
                >
                  <div className="relative w-full aspect-square overflow-hidden bg-muted">
                    <Image
                      src={deal?.imageUrl || "/placeholder.svg"}
                      alt={deal?.imageAltText || "Product"}
                      fill
                      sizes="(max-width: 640px) 176px, (max-width: 768px) 192px, 208px"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      unoptimized
                    />
                  </div>
                  <div className="p-3 space-y-1.5">
                    <div className="font-semibold text-sm text-card-foreground line-clamp-2 min-h-[2.5rem]">
                      {deal?.name}
                    </div>
                    <div className="text-xs text-price font-bold bg-price/10 px-2 py-1 rounded inline-block">
                      {formatPrice(deal?.saveUpTo)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile View: 2x2 Grid - ENHANCED */}
        <div className="sm:hidden p-2">
          <div className="grid grid-cols-2 gap-2.5">
            {deals.map((deal: any, index: number) => (
              <Link
                key={index}
                href={deal?.category?.slug ? `/category/${deal.category.slug}` : `/search?q=${encodeURIComponent(deal?.name || "")}`}
                className="group flex flex-col rounded-lg overflow-hidden
                  border border-border bg-card/50
                  hover:border-primary/40 hover:shadow-lg transition-all duration-300 hover:no-underline
                  active:scale-[0.98]"
              >
                {/* Full-width image that takes most of the space */}
                <div className="relative w-full aspect-square overflow-hidden bg-muted">
                  <Image
                    src={deal?.imageUrl || "/placeholder.svg"}
                    alt={deal?.imageAltText || "Product"}
                    fill
                    sizes="(max-width: 400px) 45vw, 180px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    priority={index < 2}
                    unoptimized
                  />
                  {/* Gradient overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Compact info section */}
                <div className="p-2 space-y-1 bg-card">
                  <div className="font-semibold text-xs leading-tight text-card-foreground line-clamp-2 min-h-[2rem]">
                    {deal?.name}
                  </div>
                  <div className="text-xs text-price font-bold bg-price/10 px-1.5 py-0.5 rounded inline-block">
                    {formatPrice(deal?.saveUpTo)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPageProductGrid;