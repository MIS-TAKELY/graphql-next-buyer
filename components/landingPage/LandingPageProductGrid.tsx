"use client";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useEffect, useCallback } from "react";

interface ILandingPageProductGrid {
  title: string;
  data: any;
  error?: any;
  forceHorizontal?: boolean; // Force horizontal layout when needed
}

const LandingPageProductGrid = ({ title, data, error, forceHorizontal = false }: ILandingPageProductGrid) => {
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

    const handleScroll = () => {
      checkScrollability();
    };

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
    const scrollAmount = 200; // Adjust based on card width
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (error) console.error(error);
  const deals = data?.getTopDealsaveUpTo?.slice(0, 4) || []; // Ensure only 4 cards

  return (
    <div className="w-full">
      <div className="border border-border rounded-lg p-3 md:p-4 bg-card shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-base sm:text-lg md:text-xl text-card-foreground">
            {title}
          </h2>
          <button className="bg-primary rounded-full flex justify-center items-center p-1 hover:bg-primary-hover transition-colors">
            <ChevronRight className="text-primary-foreground" size={20} />
          </button>
        </div>

        {/* Desktop View (14" and above - 1366px): 2x2 Grid */}
        <div className="hidden xl:block">
          <div className="grid grid-cols-2 gap-3">
            {deals.map((deal: any, index: number) => (
              <div
                key={index}
                className="group flex flex-col items-center text-center space-y-2 
                  border border-border p-3 rounded-lg 
                  hover:border-primary/30 transition-all duration-200"
              >
                <div className="relative w-24 h-24 overflow-hidden rounded-lg">
                  <Image
                    src={deal?.imageUrl || "/placeholder.svg"}
                    alt={deal?.imageAltText || "Product"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="font-medium text-sm text-card-foreground line-clamp-1">
                  {deal?.name}
                </div>
                <div className="text-xs text-price font-semibold">
                  {deal?.saveUpTo}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tablet/Medium View (below 14" - under 1366px): Horizontal Scroll 
            OR when forceHorizontal is true (for 2+1 layout) */}
        <div className={`hidden ${forceHorizontal ? 'lg:block xl:hidden' : 'sm:block'} xl:hidden`}>
          <div className="relative">
            {/* Left scroll button */}
            {canScrollLeft && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card/90 backdrop-blur-sm 
                  rounded-full p-1 shadow-md border border-border"
                aria-label="Scroll left"
              >
                <ChevronRight className="rotate-180 h-4 w-4" />
              </button>
            )}

            {/* Right scroll button */}
            {canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card/90 backdrop-blur-sm 
                  rounded-full p-1 shadow-md border border-border"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            {/* Scrollable container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {deals.map((deal: any, index: number) => (
                <div
                  key={index}
                  className="flex-shrink-0 group flex flex-col items-center text-center space-y-2 
                    border border-border p-3 rounded-lg w-36 sm:w-40 md:w-44
                    hover:border-primary/30 transition-all duration-200"
                >
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 overflow-hidden rounded-lg">
                    <Image
                      src={deal?.imageUrl || "/placeholder.svg"}
                      alt={deal?.imageAltText || "Product"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="font-medium text-xs sm:text-sm text-card-foreground line-clamp-1">
                    {deal?.name}
                  </div>
                  <div className="text-xs text-price font-semibold">
                    {deal?.saveUpTo}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile View: 2x2 Grid */}
        <div className="sm:hidden">
          <div className="grid grid-cols-2 gap-2">
            {deals.map((deal: any, index: number) => (
              <div
                key={index}
                className="group flex flex-col items-center text-center space-y-1 
                  border border-border p-2 rounded-lg
                  hover:border-primary/30 transition-all duration-200"
              >
                <div className="relative w-16 h-16 xs:w-20 xs:h-20 overflow-hidden rounded-lg">
                  <Image
                    src={deal?.imageUrl || "/placeholder.svg"}
                    alt={deal?.imageAltText || "Product"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="font-medium text-xs text-card-foreground line-clamp-1">
                  {deal?.name}
                </div>
                <div className="text-xs text-price font-semibold">
                  {deal?.saveUpTo}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPageProductGrid;