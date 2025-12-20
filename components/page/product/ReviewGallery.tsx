// components/page/product/ReviewGallery.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ReviewGalleryProps {
    images: string[];
}

export default function ReviewGallery({ images }: ReviewGalleryProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const handleNext = () => {
        setSelectedIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = () => {
        setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="mt-6">
            <h3 className="font-semibold mb-3">Customer Images ({images.length})</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((src, idx) => (
                    <Dialog key={idx} open={isOpen && selectedIndex === idx} onOpenChange={(open) => {
                        if (open) setSelectedIndex(idx);
                        setIsOpen(open);
                    }}>
                        <DialogTrigger asChild>
                            <div
                                className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer border hover:opacity-80 transition-opacity"
                                onClick={() => setSelectedIndex(idx)}
                            >
                                <Image
                                    src={src}
                                    alt="Review attachment"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl w-full h-[80vh] p-0 bg-black/90 border-none flex items-center justify-center relative">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full z-50"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-4 text-white hover:bg-white/10"
                                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </Button>

                            <div className="relative w-full h-full p-12 flex items-center justify-center">
                                <Image
                                    src={images[selectedIndex]}
                                    alt="Review full size"
                                    fill
                                    className="object-contain p-12"
                                />
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 text-white hover:bg-white/10"
                                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            >
                                <ChevronRight className="w-8 h-8" />
                            </Button>
                        </DialogContent>
                    </Dialog>
                ))}
            </div>
        </div>
    );
}
