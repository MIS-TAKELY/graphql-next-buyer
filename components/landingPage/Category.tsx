"use client";
import { GET_TOP_DEALS } from "@/client/landing/topdeals.query";
import { useQuery } from "@apollo/client";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import PlainProductCards from "./PlainProductCards";

interface CategorySectionProps {
  title: string;
  onViewAll?: () => void;
  category: string;
}

export default function CategorySection({
  title,
  onViewAll,
  category,
}: CategorySectionProps) {
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
    const cardWidth = window.innerWidth < 360 ? 128 : window.innerWidth < 640 ? 144 : window.innerWidth < 768 ? 176 : 208;
    const gap = window.innerWidth < 360 ? 4 : window.innerWidth < 640 ? 8 : 16;
    const cardsToScroll = window.innerWidth < 640 ? 1 : 2;
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

  const {
    data,
    loading: loadingDeals,
    error,
  } = useQuery(GET_TOP_DEALS, {
    variables: {
      topDealAbout: category,
      limit: 8,
    },
    fetchPolicy: "cache-first",
  });

  if (error) console.log(error);

  if (loadingDeals) {
    return <CategorySectionSkeleton title={title} />;
  }

  return (
    <section
      className="relative p-3 xs:p-4 sm:p-6 bg-card card-shadow"
      role="region"
      aria-label={`${title} products`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 xs:mb-4 sm:mb-6 px-2 sm:px-0">
        <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-card-foreground">
          {title}
        </h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="btn-rounded group flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-all duration-200"
          >
            View All
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        )}
      </div>
      {/* Scrollable Container */}
      <div className="relative" onKeyDown={handleKeyDown} tabIndex={0}>
        {/* Gradient Overlays */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-10 xs:w-12 sm:w-16 md:w-20 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            canScrollLeft ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 w-10 xs:w-12 sm:w-16 md:w-20 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            canScrollRight ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Navigation Buttons */}
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className={`btn-rounded absolute left-1 xs:left-2 top-1/2 -translate-y-1/2 z-20 transition-all duration-300 ${
            canScrollLeft
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-4 pointer-events-none"
          }`}
          aria-label="Scroll to previous products"
        >
          <div className="group relative">
            <div className="absolute -inset-1.5 bg-primary rounded-full blur-lg opacity-25 group-hover:opacity-40 transition" />
            <div className="relative flex items-center justify-center h-8 xs:h-10 sm:h-12 w-8 xs:w-10 sm:w-12 bg-card rounded-full card-shadow">
              <ChevronLeft className="h-4 xs:h-4 sm:h-5 w-4 xs:w-4 sm:w-5 text-card-foreground" />
            </div>
          </div>
        </button>
        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className={`btn-rounded absolute right-1 xs:right-2 top-1/2 -translate-y-1/2 z-20 transition-all duration-300 ${
            canScrollRight
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4 pointer-events-none"
          }`}
          aria-label="Scroll to next products"
        >
          <div className="group relative">
            <div className="absolute -inset-1.5 bg-primary rounded-full blur-lg opacity-25 group-hover:opacity-40 transition" />
            <div className="relative flex items-center justify-center h-8 xs:h-10 sm:h-12 w-8 xs:w-10 sm:w-12 bg-card rounded-full card-shadow">
              <ChevronRight className="h-4 xs:h-4 sm:h-5 w-4 xs:w-4 sm:w-5 text-card-foreground" />
            </div>
          </div>
        </button>
        {/* Products Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-[1px] overflow-x-auto scroll-smooth snap-x snap-mandatory horizontal-scroll scrollbar-hide px-2 sm:px-4 lg:px-0 pb-4"
          style={{
            WebkitOverflowScrolling: "touch",
          }}
        >
          {data?.getTopDealsaveUpTo?.map((product, index) => (
            <div key={index} className="flex-shrink-0 snap-start">
              <PlainProductCards product={product} />
            </div>
          ))}
          <div className="w-2 sm:w-4 flex-shrink-0" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

function CategorySectionSkeleton({ title }: { title: string }) {
  return (
    <section className="relative py-3 xs:py-4 sm:py-6">
      <div className="flex items-center justify-between mb-3 xs:mb-4 sm:mb-6 px-2 sm:px-0">
        <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-card-foreground">
          {title}
        </h2>
        <div className="h-4 w-24 bg-muted rounded mt-2 animate-pulse" />
      </div>
      <div className="flex gap-1 xs:gap-2 sm:gap-4 overflow-hidden px-2 sm:px-4 lg:px-0">
        {Array.from({ length: window.innerWidth < 360 ? 2 : window.innerWidth < 640 ? 3 : 5 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-32 xs:w-36 sm:w-44 md:w-52">
            <div className="rounded-xl overflow-hidden bg-card animate-pulse card-shadow">
              <div className="h-28 xs:h-32 sm:h-40 md:h-48 bg-muted" />
              <div className="p-2 xs:p-3 sm:p-4 space-y-2 xs:space-y-3">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-6 bg-muted rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}