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

  // Touch navigation and Zoom logic for mobile
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);

  // Long press for Zoom
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  // Helper to get touch position relative to element
  const getTouchPos = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    return { x, y };
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].screenX;
    touchStartY.current = e.touches[0].screenY;
    isLongPressRef.current = false;

    // Calculate position synchronously as e.currentTarget is not available in setTimeout
    const { x, y } = getTouchPos(e);

    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (throttledHover) {
        throttledHover({
          isHovering: true,
          imageUrl: currentImage?.url || "/placeholder.svg",
          position: { x, y },
        });
      }
    }, 300); // 300ms for long press
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    // If zooming (long press active), track movement and prevent scroll
    if (isLongPressRef.current) {
      if (e.cancelable) e.preventDefault(); // Prevent scrolling
      if (throttledHover) {
        const { x, y } = getTouchPos(e);
        throttledHover({
          isHovering: true,
          imageUrl: currentImage?.url || "/placeholder.svg",
          position: { x, y },
        });
      }
      return;
    }

    // Check if moved enough to cancel long press
    const moveX = Math.abs(e.touches[0].screenX - touchStartX.current);
    const moveY = Math.abs(e.touches[0].screenY - touchStartY.current);

    if (moveX > 10 || moveY > 10) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    // Clean up long press
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // If we were zooming, stop zooming
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      if (throttledHover) {
        throttledHover({
          isHovering: false,
          imageUrl: "",
          position: { x: 50, y: 50 },
        });
      }
      return;
    }

    // Existing Swipe Logic
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

  const handleContextMenu = (e: React.MouseEvent) => {
    // Prevent context menu on long press to ensure zoom feels native
    e.preventDefault();
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnail Navigation */}
      {displayImages.length > 1 && (
        <div
          className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[600px] scrollbar-hide py-1 px-1"
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
                className={`
                  flex-shrink-0 w-16 h-16 md:w-20 md:h-20 
                  rounded-xl overflow-hidden border-2 transition-all duration-300 transform
                  focus:outline-none focus:ring-2 focus:ring-primary
                  ${isSelected
                    ? "border-primary ring-2 ring-primary/30 scale-105"
                    : "border-border hover:border-primary/50"
                  }
                `}
                aria-label={`View image ${index + 1} of ${displayImages.length}`}
                aria-selected={isSelected}
                role="tab"
              >
                <div className="relative w-full h-full bg-secondary/10">
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={
                      image.altText || `${productName} thumbnail ${index + 1}`
                    }
                    fill
                    className="object-cover"
                    sizes="80px"
                    loading={index > 4 ? "lazy" : "eager"}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Image Display (swipeable) */}
      <div className="flex-1 w-full relative group">
        <div
          className="relative aspect-square w-full bg-card rounded-2xl overflow-hidden border border-border shadow-sm transition-shadow hover:shadow-md cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onContextMenu={handleContextMenu}
          aria-label={`${productName} image gallery`}
        >
          {imageLoading && (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-muted/20 animate-pulse flex items-center justify-center"
            >
              <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {imageError ? (
            <div
              className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900"
              role="status"
              aria-live="polite"
            >
              <div className="text-center text-muted-foreground">
                <p className="text-sm">Image unavailable</p>
              </div>
            </div>
          ) : (
            <Image
              src={currentImage?.url || "/placeholder.svg"}
              alt={currentImage?.altText || `${productName} main image`}
              fill
              className="object-cover transition-opacity duration-300 will-change-transform"
              style={{ opacity: imageLoading ? 0 : 1 }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              priority={selectedImage === 0}
              sizes="(max-width: 768px) 100vw, 800px"
              quality={90}
            />
          )}
        </div>

        {/* Image Counter Badge */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 right-4 z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
            <span className="text-xs font-medium text-foreground bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border">
              {Math.min(selectedImage + 1, displayImages.length)} / {displayImages.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

export default ProductGallery;
