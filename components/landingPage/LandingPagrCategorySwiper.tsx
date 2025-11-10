"use client";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import PlainProductCards from "./PlainProductCards";
import { LandingPagrCategorySwiperData, TopDeal } from "./types";

interface Props {
  title: string;
  onViewAll?: () => void;
  data: LandingPagrCategorySwiperData;
}

export default function LandingPagrCategorySwiper({
  title,
  onViewAll,
  data,
}: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);

  const checkScrollability = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      setIsScrolling(true);
      checkScrollability();
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => setIsScrolling(false), 150);
    };

    checkScrollability();
    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", checkScrollability, { passive: true });

    const resizeObserver = new ResizeObserver(checkScrollability);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkScrollability);
      resizeObserver.disconnect();
      clearTimeout(scrollTimeout);
    };
  }, [checkScrollability]);

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth =
      window.innerWidth < 360
        ? 140
        : window.innerWidth < 640
        ? 160
        : window.innerWidth < 768
        ? 180
        : window.innerWidth < 1024
        ? 200
        : 220;
    const gap = window.innerWidth < 360 ? 8 : window.innerWidth < 640 ? 12 : 16;
    const cardsToScroll =
      window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3;
    const scrollAmount = (cardWidth + gap) * cardsToScroll;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") scroll("left");
      if (e.key === "ArrowRight") scroll("right");
    },
    [scroll]
  );

  return (
    <section
      className="relative py-2 sm:p-4 md:p-6 bg-card sm:card-shadow" // Changed padding
      role="region"
      aria-label={`${title} products`}
    >
      {/* Header - with horizontal padding on mobile */}
      <div className="flex items-center justify-between mb-3 xs:mb-4 sm:mb-6 px-3 sm:px-0">
        <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-card-foreground">
          {title}
        </h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="btn-rounded group flex items-center gap-2 text-xs xs:text-sm sm:text-base font-semibold text-primary hover:text-primary-hover transition-all duration-200"
          >
            View All
            <ArrowRight className="h-3 xs:h-4 sm:h-5 w-3 xs:w-4 sm:w-5 transition-transform group-hover:translate-x-1" />
          </button>
        )}
      </div>

      {/* Scrollable Container */}
      <div className="relative" onKeyDown={handleKeyDown} tabIndex={0}>
        {/* Gradient Overlays */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-6 xs:w-8 sm:w-12 md:w-16 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            canScrollLeft ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 w-6 xs:w-8 sm:w-12 md:w-16 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            canScrollRight ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Navigation Buttons - Hidden on very small screens */}
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className={`hidden xs:flex btn-rounded absolute left-1 xs:left-2 sm:left-0 top-1/2 -translate-y-1/2 z-20 transition-all duration-300 ${
            canScrollLeft
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-4 pointer-events-none"
          }`}
          aria-label="Scroll to previous products"
        >
          <div className="group relative">
            <div className="absolute -inset-1.5 bg-primary rounded-full blur-lg opacity-25 group-hover:opacity-40 transition" />
            <div className="relative flex items-center justify-center h-7 xs:h-8 sm:h-10 md:h-12 w-7 xs:w-8 sm:w-10 md:w-12 bg-card rounded-full card-shadow">
              <ChevronLeft className="h-3 xs:h-4 sm:h-5 md:h-6 w-3 xs:w-4 sm:w-5 md:w-6 text-card-foreground" />
            </div>
          </div>
        </button>

        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className={`hidden xs:flex btn-rounded absolute right-1 xs:right-2 sm:right-0 top-1/2 -translate-y-1/2 z-20 transition-all duration-300 ${
            canScrollRight
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4 pointer-events-none"
          }`}
          aria-label="Scroll to next products"
        >
          <div className="group relative">
            <div className="absolute -inset-1.5 bg-primary rounded-full blur-lg opacity-25 group-hover:opacity-40 transition" />
            <div className="relative flex items-center justify-center h-7 xs:h-8 sm:h-10 md:h-12 w-7 xs:w-8 sm:w-10 md:w-12 bg-card rounded-full card-shadow">
              <ChevronRight className="h-3 xs:h-4 sm:h-5 md:h-6 w-3 xs:w-4 sm:w-5 md:w-6 text-card-foreground" />
            </div>
          </div>
        </button>

        {/* Products Container - Full width on mobile */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pl-3 sm:pl-0"
          style={{
            WebkitOverflowScrolling: "touch",
          }}
        >
          {data?.getTopDealsaveUpTo?.map(
            (product: TopDeal, index: number) => (
              <div key={index} className="flex-shrink-0 snap-start">
                <PlainProductCards product={product} />
              </div>
            )
          )}
          {/* Right padding on mobile for last item visibility */}
          <div className="w-3 sm:w-0 flex-shrink-0" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
