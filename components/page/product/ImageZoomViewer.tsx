// components/page/product/ImageZoomViewer.tsx
"use client";
import Image from "next/image";
import { memo, type HTMLAttributes } from "react";

interface ImageZoomViewerProps {
  imageUrl: string;
  position: { x: number; y: number };
  productName: string;
  overlayClassName?: string;
}

const ImageZoomViewer = memo(function ImageZoomViewer({
  imageUrl,
  position,
  productName,
  overlayClassName = "",
}: ImageZoomViewerProps & HTMLAttributes<HTMLDivElement>) {
  if (!imageUrl) return null;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shadow-2xl ${overlayClassName}`}
    >
      <div className="relative w-full h-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={`${productName} zoomed detail`}
          fill
          className="object-cover"
          style={{
            transform: `scale(2.5)`,
            transformOrigin: `${position.x}% ${position.y}%`,
            transition: "transform-origin 0.05s ease-out",
          }}
          sizes="(max-width: 768px) 100vw, 600px"
          priority
          unoptimized
        />
      </div>
      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full animate-fade-in">
        <span className="lg:hidden">Release to close</span>
        <span className="hidden lg:inline">Zoom Active</span>
      </div>
    </div>
  );
});

ImageZoomViewer.displayName = "ImageZoomViewer";

export default ImageZoomViewer;