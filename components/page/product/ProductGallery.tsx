"use client";

import Image from "next/image";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

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

function usePointerHoverCapability() {
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    try {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    } catch {
      // Safari fallback
      mq.addListener(update);
      return () => mq.removeListener(update);
    }
  }, []);
  return canHover;
}

function useRafThrottledCallback<T extends (...args: any[]) => void>(cb?: T) {
  const cbRef = useRef(cb);
  const frame = useRef<number | null>(null);
  cbRef.current = cb;

  return useCallback(
    ((...args: any[]) => {
      if (!cbRef.current) return;
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        cbRef.current?.(...args);
      });
    }) as T,
    []
  );
}

const ProductGallery = memo(function ProductGallery({
  images,
  productName,
  onImageHover,
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const canHover = usePointerHoverCapability();

  const displayImages = useMemo<ProductImage[]>(() => {
    if (!images || images.length === 0) return [];
    return images.filter((image) => image.mediaType !== "PROMOTIONAL");
  }, [images]);

  const currentImage =
    displayImages[Math.min(selectedImage, displayImages.length - 1)];

  const handleImageSelect = useCallback((index: number) => {
    setSelectedImage(index);
    setImageLoading(true);
    setImageError(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    setImageError(true);
  }, []);

  const throttledHover = useRafThrottledCallback(onImageHover);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!throttledHover || imageError || imageLoading || !canHover) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      throttledHover({
        isHovering: true,
        imageUrl: currentImage?.url || "/placeholder.svg",
        position: { x, y },
      });
    },
    [throttledHover, imageError, imageLoading, canHover, currentImage?.url]
  );

  const handleMouseLeave = useCallback(() => {
    if (!onImageHover) return;
    onImageHover({
      isHovering: false,
      imageUrl: "",
      position: { x: 50, y: 50 },
    });
  }, [onImageHover]);

  const onThumbKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleImageSelect(index);
      }
    },
    [handleImageSelect]
  );

  // Touch navigation for mobile
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const deltaX = touchStartX.current - touchEndX.current;

    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        handleImageSelect(Math.min(selectedImage + 1, displayImages.length - 1));
      } else {
        handleImageSelect(Math.max(selectedImage - 1, 0));
      }
    }
  };

  return (
    <div className="flex gap-2">
      {/* Thumbnail Navigation (hidden on mobile) */}
      {displayImages.length > 1 && (
        <div
          className="hidden md:flex flex-col gap-1 overflow-y-auto max-h-[600px] pb-2"
          role="tablist"
          aria-label="Product image thumbnails"
        >
          {displayImages.map((image, index) => {
            const isSelected = selectedImage === index;
            return (
              <button
                key={image.id || index}
                onClick={() => handleImageSelect(index)}
                onKeyDown={(e) => onThumbKeyDown(e, index)}
                className={`flex-shrink-0 w-15 h-15 rounded-lg overflow-hidden border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isSelected
                    ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-600"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
                aria-label={`View image ${index + 1} of ${displayImages.length}`}
                aria-selected={isSelected}
                role="tab"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={
                      image.altText || `${productName} thumbnail ${index + 1}`
                    }
                    fill
                    className="object-cover"
                    sizes="40px"
                    loading={index > 4 ? "lazy" : "eager"}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Image Display (swipeable) */}
      <div className="flex-1 space-y-2">
        <div
          className="relative aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-label={`${productName} image gallery`}
        >
          {imageLoading && (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center"
            >
              <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin" />
            </div>
          )}

          {imageError ? (
            <div
              className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900"
              role="status"
              aria-live="polite"
            >
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-sm">Image unavailable</p>
              </div>
            </div>
          ) : (
            <Image
              src={currentImage?.url || "/placeholder.svg"}
              alt={currentImage?.altText || `${productName} main image`}
              fill
              className="object-cover transition-opacity duration-300 will-change-auto"
              style={{ opacity: imageLoading ? 0 : 1 }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              priority={selectedImage === 0}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 650px"
              quality={100}
            />
          )}
        </div>

        {/* Image Counter */}
        {displayImages.length > 1 && (
          <div className="flex justify-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {Math.min(selectedImage + 1, displayImages.length)} of{" "}
              {displayImages.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

export default ProductGallery;
