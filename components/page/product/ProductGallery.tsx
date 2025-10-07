// components/page/product/ProductGallery.tsx
"use client";
import Image from "next/image";
import { memo, useCallback, useMemo, useState } from "react";

interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  sortOrder?: number;
  mediaType?: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  onImageHover?: (data: {
    isHovering: boolean;
    imageUrl: string;
    position: { x: number; y: number };
  }) => void;
  hasMultipleImages?: boolean;
}

const ProductGallery = memo(function ProductGallery({
  images,
  productName,
  onImageHover,
  hasMultipleImages = false,
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const sortedImages = useMemo(() => {
    if (!Array.isArray(images) || images.length === 0) {
      return [
        {
          id: "placeholder",
          url: "/placeholder.svg",
          altText: `${productName} placeholder`,
          sortOrder: 0,
        },
      ];
    }

    // Filter for PRIMARY images for gallery
    return [...images]
      .filter((image) => image.mediaType === "PRIMARY")
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [images, productName]);

  const currentImage = sortedImages[selectedImage];

  const handleImageSelect = useCallback((index: number) => {
    if (index === selectedImage) return;
    setSelectedImage(index);
    setImageLoading(true);
    setImageError(false);
  }, [selectedImage]);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    setImageError(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onImageHover || imageError || !currentImage?.url) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

      onImageHover({
        isHovering: true,
        imageUrl: currentImage.url,
        position: { x, y },
      });
    },
    [onImageHover, imageError, currentImage?.url]
  );

  const handleMouseLeave = useCallback(() => {
    if (!onImageHover) return;
    onImageHover({
      isHovering: false,
      imageUrl: "",
      position: { x: 50, y: 50 },
    });
  }, [onImageHover]);

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div
        className="relative aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 cursor-crosshair hover:cursor-zoom-in transition-shadow duration-200 hover:shadow-md"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        role="img"
        aria-label={`${productName} main image, hover to zoom`}
      >
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center z-10">
            <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>
          </div>
        )}

        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400 dark:text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
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
            className="object-cover transition-opacity duration-300"
            style={{ opacity: imageLoading ? 0 : 1 }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            priority={selectedImage === 0}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
            quality={85}
          />
        )}
      </div>

      {/* Thumbnail Navigation */}
      {hasMultipleImages && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {sortedImages.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => handleImageSelect(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 relative group ${
                selectedImage === index
                  ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-600"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
              aria-label={`View image ${index + 1} of ${sortedImages.length} for ${productName}`}
            >
              <div className="relative w-full h-full">
                <Image
                  src={image.url || "/placeholder.svg"}
                  alt={image.altText || `${productName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-200"
                  sizes="80px"
                  quality={70}
                  loading="lazy"
                />
                {selectedImage === index && (
                  <div className="absolute inset-0 bg-blue-500/20 rounded-lg"></div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {hasMultipleImages && (
        <div className="flex justify-center">
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {selectedImage + 1} of {sortedImages.length}
          </span>
        </div>
      )}
    </div>
  );
});

ProductGallery.displayName = "ProductGallery";

export default ProductGallery;