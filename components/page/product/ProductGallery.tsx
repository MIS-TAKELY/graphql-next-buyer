"use client";

import { Button } from "@/components/ui/button";
import SmartMedia from "@/components/ui/SmartMedia";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState, useRef } from "react";
import ImageZoomViewer from "./ImageZoomViewer";

interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  sortOrder?: number;
  mediaType?: string | null;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  onImageHover?: (data: {
    isHovering: boolean;
    imageUrl: string;
    position: { x: number; y: number };
  }) => void;
}

const ProductGallery = memo(function ProductGallery({
  images,
  productName,
  onImageHover,
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [isDesktop, setIsDesktop] = useState(false);

  // Filter valid images
  const displayImages = useMemo<ProductImage[]>(() => {
    if (!images || images.length === 0) return [];
    return images.filter((image) => image.mediaType !== "PROMOTIONAL");
  }, [images]);

  // Check viewport for desktop zoom
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.matchMedia("(min-width: 1024px)").matches);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // Sync state with Embla
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedImage(index);

    // Note: SmartMedia handles its own video state.
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  // Desktop Hover Zoom Logic
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDesktop || !onImageHover) return;

    const currentImg = displayImages[selectedImage];
    const isVideo = currentImg?.mediaType === "VIDEO" || currentImg?.url?.toLowerCase().endsWith(".mp4") || currentImg?.url?.toLowerCase().endsWith(".webm");

    if (isVideo) return;

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    const imageUrl = currentImg?.url || "";

    if (!imageUrl) return;

    onImageHover({
      isHovering: true,
      imageUrl,
      position: { x, y }
    });
  }, [isDesktop, onImageHover, displayImages, selectedImage]);

  const handleMouseLeave = useCallback(() => {
    if (onImageHover) {
      onImageHover({ isHovering: false, imageUrl: "", position: { x: 0, y: 0 } });
    }
  }, [onImageHover]);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 h-full">
      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex lg:flex-col gap-2 overflow-auto scrollbar-hide shrink-0 lg:w-20 lg:max-h-[600px]">
          {displayImages.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => scrollTo(index)}
              className={`relative w-16 h-16 lg:w-20 lg:h-20 shrink-0 rounded-md overflow-hidden border-2 transition-all group
              ${selectedImage === index ? "border-primary" : "border-transparent hover:border-gray-200"}`}
            >
              <SmartMedia
                src={image.url}
                alt={image.altText || `Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Carousel Viewport */}
      <div className="relative flex-1 bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full touch-pan-y">
            {displayImages.map((image, index) => (
              <div
                key={image.id || index}
                className="relative flex-[0_0_100%] min-w-0 h-[400px] sm:h-[500px] lg:h-[600px] bg-white dark:bg-gray-900"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <div className="relative w-full h-full flex items-center justify-center p-2 group">
                  <SmartMedia
                    src={image.url}
                    alt={image.altText || productName}
                    fill
                    className="object-contain"
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Navigation Arrows */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 lg:hidden pointer-events-none">
          <Button
            size="icon"
            variant="ghost"
            onClick={scrollPrev}
            className="pointer-events-auto bg-black/10 hover:bg-black/20 text-black dark:text-white rounded-full backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={scrollNext}
            className="pointer-events-auto bg-black/10 hover:bg-black/20 text-black dark:text-white rounded-full backdrop-blur-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Counter Badge */}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-md z-10">
          {selectedImage + 1} / {displayImages.length}
        </div>
      </div>
    </div>
  );
});

export default ProductGallery;
