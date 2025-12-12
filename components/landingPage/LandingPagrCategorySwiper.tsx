
"use client";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import PlainProductCards from "./PlainProductCards";
import { LandingPagrCategorySwiperData, TopDeal } from "./types";

interface Props {
  title: string;
  onViewAll?: () => void;
  data: LandingPagrCategorySwiperData;
}

export default function LandingPagrCategorySwiper({ title, onViewAll, data }: Props) {
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
    window.addEventListener("resize", checkScrollability);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkScrollability);
    };
  }, [checkScrollability]);

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = window.innerWidth < 768 ? 180 : 220;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  return (
    <section className="relative py-2 sm:py-4 md:py-6 container-custom bg-card">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 px-2 sm:px-0">
        {/* ✅ Wrapped Title in a Link */}
        <Link
          href={`/search?q=${encodeURIComponent(title)}`}
          className="text-lg p-4 sm:text-xl md:text-2xl font-bold text-card-foreground hover:text-primary transition-colors"
        >
          {title}
        </Link>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="btn-rounded flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:text-primary-hover"
          >
            View All <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        )}
      </div>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 sm:gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide px-2 sm:px-0"
      >
        {data?.getTopDealSaveUpTo?.map((product: TopDeal, index: number) => (
          <PlainProductCards key={index} product={product} />
        ))}
        <div className="w-2 sm:w-0 flex-shrink-0" aria-hidden="true" />
      </div>

      {/* Scroll Buttons */}
      <button
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-card p-1 border border-border shadow-sm"
      >
        <ChevronLeft className="text-card-foreground" />
      </button>
      <button
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-card p-1 border border-border shadow-sm"
      >
        <ChevronRight className="text-card-foreground" />
      </button>
    </section>
  );
}
