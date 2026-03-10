"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";


interface ILandingPageProductGrid {
  title: string;
  data: any;
  error?: any;
  forceHorizontal?: boolean; // Force horizontal layout when needed
  categorySlug?: string;
}

const LandingPageProductGrid = memo(function LandingPageProductGrid({
  title,
  data,
  error,
  forceHorizontal = false,
  categorySlug,
}: ILandingPageProductGrid) {
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

    checkScrollability();
    container.addEventListener("scroll", checkScrollability, { passive: true });
    window.addEventListener("resize", checkScrollability, { passive: true });

    return () => {
      container.removeEventListener("scroll", checkScrollability);
      window.removeEventListener("resize", checkScrollability);
    };
  }, [checkScrollability]);

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -200 : 200,
      behavior: "smooth",
    });
  }, []);

  const scrollLeft = useCallback(() => scroll("left"), [scroll]);
  const scrollRight = useCallback(() => scroll("right"), [scroll]);

  if (error) console.error(error);

  const deals = useMemo(() => data?.getTopDealSaveUpTo?.slice(0, 4) || [], [data]);

  const titleHref = useMemo(
    () =>
      categorySlug
        ? `/category/${categorySlug}`
        : `/search?q=${encodeURIComponent(title)}`,
    [categorySlug, title]
  );

  return (
    <div className="w-full">
      <div className="rounded-lg overflow-hidden bg-card h-full">
        {/* Header */}
        <div className="flex justify-between items-center bg-gradient-to-r from-card to-card/95 px-3 sm:px-4">
          <Link
            href={titleHref}
            className="text-lg py-4 sm:text-xl md:text-2xl font-bold text-card-foreground tracking-tight hover:text-primary transition-colors"
          >
            {title}
          </Link>
        </div>

        {/* Desktop View (≥1366px): 2x2 Grid */}
        <div className="hidden xl:block p-3">
          <div className="grid grid-cols-2 gap-3">
            {deals.map((deal: any, index: number) => (
              <DealCard key={index} deal={deal} sizes="200px" />
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
                onClick={scrollLeft}
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
                onClick={scrollRight}
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
                <DealCard
                  key={index}
                  deal={deal}
                  sizes="(max-width: 640px) 176px, (max-width: 768px) 192px, 208px"
                  className="flex-shrink-0 w-44 sm:w-48 md:w-52"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile View: 2x2 Grid */}
        <div className="sm:hidden p-2">
          <div className="grid grid-cols-2 gap-2.5">
            {deals.map((deal: any, index: number) => (
              <DealCard
                key={index}
                deal={deal}
                sizes="(max-width: 400px) 45vw, 180px"
                priority={index < 2}
                compact
              />
            ))}
          </div>j
        </div>
      </div>
    </div>
  );
});

LandingPageProductGrid.displayName = "LandingPageProductGrid";

export default LandingPageProductGrid;

// ── Sub-component extracted to avoid building the same JSX 3 times ─────────

interface DealCardProps {
  deal: any;
  sizes: string;
  className?: string;
  priority?: boolean;
  compact?: boolean;
}

const DealCard = memo(function DealCard({
  deal,
  sizes,
  className = "",
  priority = false,
  compact = false,
}: DealCardProps) {
  const href = deal?.category?.slug
    ? `/category/${deal.category.slug}`
    : `/search?q=${encodeURIComponent(deal?.name || "")}`;

  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-lg overflow-hidden bg-card/50
        hover:shadow-md transition-all duration-300 hover:no-underline
        ${compact ? "active:scale-[0.98]" : ""} ${className}`}
    >
      <div className="relative w-full aspect-square overflow-hidden bg-muted">
        <Image
          src={deal?.imageUrl || "/placeholder.svg"}
          alt={deal?.imageAltText || "Product"}
          fill
          sizes={sizes}
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          priority={priority}
          unoptimized
        />
        {compact && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </div>
      <div className={`space-y-1.5 bg-card ${compact ? "p-2" : "p-3"}`}>
        <div
          className={`font-semibold text-card-foreground line-clamp-2 ${compact ? "text-xs leading-tight min-h-[2rem]" : "text-sm min-h-[2.5rem]"
            }`}
        >
          {deal?.name}
        </div>
        <div
          className={`text-price font-bold bg-price/10 rounded inline-block ${compact ? "text-xs px-1.5 py-0.5" : "text-sm px-2 py-1"
            }`}
        >
          {compact ? formatPrice(deal?.saveUpTo) : `Save up to ${formatPrice(deal?.saveUpTo)}`}
        </div>
      </div>
    </Link>
  );
});

DealCard.displayName = "DealCard";