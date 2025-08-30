"use client"

import test from "@/assets/403609db54d2a0d0.webp";
import electronicsDeal from "@/assets/electronics-deal.jpg";
import fashionDiscount from "@/assets/fashion-discount.jpg";
import festivalSale from "@/assets/festival-sale.jpg";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useEffect, useState } from "react";

// Move slides outside component to prevent recreation
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

// Memoized slide component
interface SlideProps {
  slide: {
    id: number;
    image: any;
    title: string;
    subtitle: string;
    description: string;
  };
  isHovered: boolean;
}

const Slide = memo(({ slide, isHovered }: SlideProps) => (
  <div className="min-w-full relative">
    <Image
      src={slide.image}
      alt={slide.title}
      fill
      className={`object-cover z-0 transition-all duration-300 ${
        isHovered ? "filter blur-sm" : ""
      }`}
      sizes="100vw"
      priority={slide.id === 1} // Only prioritize first slide
    />
    <div
      className="absolute inset-0 flex items-center justify-center transition-all duration-300"
      style={{
        backgroundColor: isHovered ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0)",
      }}
    >
      <div className="text-center text-white px-4 w-full max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%]">
        <h2
          className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 drop-shadow-lg transition-all duration-300"
          style={{
            transform: isHovered ? "translateY(0)" : "translateY(20px)",
            opacity: isHovered ? 1 : 0,
          }}
        >
          {slide.title}
        </h2>
        <p
          className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-2 text-secondary font-semibold drop-shadow-md transition-all duration-300"
          style={{
            transform: isHovered ? "translateY(0)" : "translateY(30px)",
            opacity: isHovered ? 1 : 0,
          }}
        >
          {slide.subtitle}
        </p>
        <p
          className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 max-w-[90%] mx-auto drop-shadow-md transition-all duration-300"
          style={{
            transform: isHovered ? "translateY(0)" : "translateY(40px)",
            opacity: isHovered ? 1 : 0,
          }}
        >
          {slide.description}
        </p>
        <div
          className="transition-all duration-300"
          style={{
            transform: isHovered ? "translateY(0)" : "translateY(50px)",
            opacity: isHovered ? 1 : 0,
          }}
        >
          <Button className="btn-hero text-sm sm:text-base md:text-lg px-6 sm:px-8 py-2 sm:py-3 bg-white text-black hover:bg-gray-200">
            Shop Now
          </Button>
        </div>
      </div>
    </div>
  </div>
));

Slide.displayName = "Slide";

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Memoize navigation functions
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Auto-rotate carousel with cleanup
  useEffect(() => {
    if (isHovered) return; // Pause on hover

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <div
      className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] xl:h-[80vh] max-h-[600px] overflow-hidden bg-gradient-to-r from-primary to-secondary"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {SLIDES.map((slide) => (
          <Slide key={slide.id} slide={slide} isHovered={isHovered} />
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 rounded-full p-2 sm:p-3 z-10"
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
      <Button
        variant="ghost"
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 rounded-full p-2 sm:p-3 z-10"
        aria-label="Next slide"
      >
        <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2 z-10">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
