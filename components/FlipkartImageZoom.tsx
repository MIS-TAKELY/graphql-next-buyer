"use client";

import React, { useState, useRef, useEffect, TouchEvent, MouseEvent } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils"; // Assuming utils exists based on project structure (ui components use it)

interface FlipkartImageZoomProps {
    images: string[];
    zoomLevel?: number;
    baseImageClassName?: string;
}

export default function FlipkartImageZoom({
    images,
    zoomLevel = 2.5,
    baseImageClassName,
}: FlipkartImageZoomProps) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    // Ref for the image container to calculate dimensions
    const imgContainerRef = useRef<HTMLDivElement>(null);

    // Constants for lens size calculation (percentage of container)
    // These will be dynamic based on the ratio of ZoomBox / MainImage * zoomLevel, 
    // but for "Flipkart style" a fixed visual lens size often works best with calculated background position.
    // We'll calculate lens dimensions on the fly or use fixed relative sizing.
    const [lensDims, setLensDims] = useState({ width: 0, height: 0 });
    const [isMobile, setIsMobile] = useState(false);

    // Check for mobile on mount to adjust behavior (optional, but good for initial state)
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // --- Handlers ---

    const handleMouseEnter = () => {
        if (isMobile) return; // Mobile uses touch
        setIsZoomed(true);
    };

    const handleMouseLeave = () => {
        if (isMobile) return;
        setIsZoomed(false);
    };

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (isMobile || !imgContainerRef.current) return;
        calculateZoom(e.clientX, e.clientY);
    };

    const handleTouchStart = () => {
        setIsZoomed(true);
    };

    const handleTouchEnd = () => {
        setIsZoomed(false);
    };

    const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
        if (!imgContainerRef.current) return;
        // Prevent scrolling while zooming on image
        // e.preventDefault(); // React synthetic events might not support this directly in all cases without passive: false

        const touch = e.touches[0];
        calculateZoom(touch.clientX, touch.clientY);
    };

    const calculateZoom = (clientX: number, clientY: number) => {
        if (!imgContainerRef.current) return;

        const { left, top, width, height } = imgContainerRef.current.getBoundingClientRect();

        // Calculate cursor position relative to the image in % (0 to 1)
        let x = (clientX - left) / width;
        let y = (clientY - top) / height;

        // Clamp values
        x = Math.max(0, Math.min(1, x));
        y = Math.max(0, Math.min(1, y));

        setPosition({ x, y });

        // Calculate Lens Dimensions based on zoom level (only for desktop visual)
        // If zoom level is 2.5, lens should be roughly 1/2.5 of the image size
        if (!isMobile) {
            setLensDims({
                width: width / zoomLevel,
                height: height / zoomLevel
            });
        }
    };

    // Derived state for lens position (centered on cursor)
    // We want the lens to follow the cursor, but stay within bounds.
    // The 'position' state is the raw cursor position (0-1).
    // We need to convert that to CSS 'left'/'top' for the lens, 
    // ensuring the lens doesn't overflow the container.

    const getLensStyle = () => {
        if (!imgContainerRef.current) return {};
        const { width, height } = imgContainerRef.current.getBoundingClientRect();

        // Lens size
        const lensW = lensDims.width || 100;
        const lensH = lensDims.height || 100;

        // Convert normalized position to pixels
        let left = position.x * width - lensW / 2;
        let top = position.y * height - lensH / 2;

        // Clamp lens within container
        left = Math.max(0, Math.min(width - lensW, left));
        top = Math.max(0, Math.min(height - lensH, top));

        return {
            left: `${left}px`,
            top: `${top}px`,
            width: `${lensW}px`,
            height: `${lensH}px`,
        };
    };

    // Zoomed Image Background Position
    // If cursor is at 0,0 (top-left), background-position should be 0% 0%
    // If cursor is at 1,1 (bottom-right), background-position should be 100% 100%
    const getZoomResultStyle = () => {
        return {
            backgroundImage: `url(${images[activeImageIndex]})`,
            backgroundPosition: `${position.x * 100}% ${position.y * 100}%`,
            backgroundSize: `${zoomLevel * 100}%`,
        };
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 relative">
            {/* Thumbnail List (Left/Bottom depending on layout, here simplified to Left/Row) */}
            <div className="flex  md:flex-col gap-2 order-2 md:order-1 overflow-x-auto md:overflow-hidden md:min-h-[400px]">
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onMouseEnter={() => setActiveImageIndex(idx)}
                        onClick={() => setActiveImageIndex(idx)}
                        className={cn(
                            "relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 border cursor-pointer overflow-hidden rounded-sm transition-all",
                            activeImageIndex === idx ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200 hover:border-blue-300"
                        )}
                    >
                        <Image
                            src={img}
                            alt={`Product thumbnail ${idx + 1}`}
                            fill
                            className="object-contain p-1"
                            unoptimized
                        />
                    </button>
                ))}
            </div>

            {/* Main Image Container */}
            <div
                className="relative order-1 md:order-2 flex-grow z-10"
                ref={imgContainerRef}
            >
                <div
                    className={cn("relative w-full h-[300px] md:h-[500px] bg-white border border-gray-100 flex items-center justify-center cursor-crosshair overflow-hidden", baseImageClassName)}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <Image
                        src={images[activeImageIndex]}
                        alt="Product View"
                        fill
                        priority
                        className="object-contain p-4"
                        unoptimized
                    />

                    {/* Lens (Desktop Only) */}
                    {isZoomed && !isMobile && (
                        <div
                            className="absolute border border-gray-400/50 bg-blue-500/10 pointer-events-none"
                            style={getLensStyle()}
                        />
                    )}
                </div>

                {/* Zoom Result Portal/Container */}
                {/* For Desktop: To the right. For Mobile: On top/overlay */}
                {isZoomed && (
                    <div
                        className={cn(
                            "absolute bg-white border border-gray-200 shadow-xl overflow-hidden z-50",
                            isMobile
                                ? "fixed left-0 top-0 w-full h-full md:hidden"
                                : "hidden md:block w-[500px] h-[500px]"
                        )}
                        style={
                            isMobile ? { top: 0, left: 0, bottom: 0, right: 0, zIndex: 9999 } : { left: '100%', top: 0, marginLeft: '20px' }
                        }
                    >
                        {/* The Zoomed Image */}
                        <div
                            className="w-full h-full bg-no-repeat"
                            style={getZoomResultStyle()}
                        ></div>
                    </div>
                )}
            </div>

            {/* Helper text for Mobile */}
            <div className="md:hidden absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none opacity-0 transition-opacity duration-1000 delay-1000 animate-[fadeInOut_4s_ease-in-out_forwards]">
                Move to Zoom
            </div>
            <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
        </div>
    );
}
