// components/page/home/HeroCarousel.tsx
"use client";
import test from "@/assets/403609db54d2a0d0.webp";
import electronicsDeal from "@/assets/electronics-deal.jpg";
import fashionDiscount from "@/assets/fashion-discount.jpg";
import festivalSale from "@/assets/festival-sale.jpg";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useEffect, useState } from "react";

const SLIDES = [
  {
    id: 1,
    image: festivalSale,
    title: "Festival Sale",
    subtitle: "Up to 70% Off",
    description: "Biggest sale of the year on all categories",
  },
  {
    id: 2,
    image: electronicsDeal,
    title: "Electronics Deal",
    subtitle: "Mega Sale",
    description: "Latest gadgets at unbeatable prices",
  },
  {
    id: 3,
    image: fashionDiscount,
    title: "Fashion Discount",
    subtitle: "Up to 50% Off",
    description: "Trendy fashion for every occasion",
  },
  {
    id: 4,
    image: test,
    title: "Fashion Discount",
    subtitle: "Up to 50% Off",
    description: "Trendy fashion for every occasion",
  },
];

interface SlideProps {
  slide: {
    id: number;
    image: any;
    title: string;
    subtitle: string;
    description: string;
  };
  isActive: boolean;
}

const Slide = memo(({ slide, isActive }: SlideProps) => (
  <div className="relative h-full w-full flex-[0_0_100%] min-w-0">
    <Image
      src={slide.image}
      alt={slide.title}
      fill
      className={`object-cover z-0 transition-all duration-700 ${isActive ? "scale-100 blur-0" : "scale-105 blur-sm"
        }`}
      sizes="100vw"
      priority={slide.id === 1}
    />
    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
      <div className={`text-center text-white px-4 max-w-[90%] sm:max-w-[70%] transition-all duration-700 delay-100 ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}>
        <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 drop-shadow-xl">
          {slide.title}
        </h2>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-4 font-medium text-gray-200 drop-shadow-md">
          {slide.subtitle}
        </p>
        <p className="text-sm sm:text-base md:text-lg mb-6 max-w-2xl mx-auto text-gray-300 hidden sm:block">
          {slide.description}
        </p>
        <Button className="rounded-full px-8 py-6 text-lg bg-white text-black hover:bg-gray-100 border-none">
          Shop Now
        </Button>
      </div>
    </div>
  </div>
));
Slide.displayName = "Slide";

export default function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    // Auto-play
    const autoplay = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      }
    }, 5000);

    return () => {
      clearInterval(autoplay);
    }
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <div className="container-custom py-4 sm:py-6">
      <div className="relative h-[250px] sm:h-[400px] md:h-[500px] lg:h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl group">

        {/* Carousel Viewport */}
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full touch-pan-y">
            {SLIDES.map((slide, index) => (
              <Slide key={slide.id} slide={slide} isActive={index === selectedIndex} />
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollPrev}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
        >
          <ChevronLeftIcon className="w-6 h-6 sm:w-8 sm:h-8" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={scrollNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
        >
          <ChevronRightIcon className="w-6 h-6 sm:w-8 sm:h-8" />
        </Button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${index === selectedIndex ? "bg-white w-6 sm:w-8" : "bg-white/50 hover:bg-white/80"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}