"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useCompareStore } from "@/store/compareStore";
import { toast } from "sonner";
import { MouseEvent } from "react";

interface Specification {
  value: string;
}

interface Variant {
  price: number;
  mrp: number;
  specifications: Specification[];
}

interface ImageType {
  altText: string;
  url: string;
}

interface Review {
  rating: number;
}

interface Category {
  name: string;
}

interface SearchProduct {
  id: string;
  name: string;
  variants: Variant[];
  images: ImageType[];
  reviews: Review[];
  description: string;
  brand: string;
  features?: string[];
  slug: string;
  category: Category;
  deliveryOptions?: { title: string }[];
}

interface ProductCardProps {
  product: SearchProduct;
}

// Horizontal "List View" layout - Slim and Sleek
export default function ProductCard({ product }: ProductCardProps) {
  const variant = product.variants[0] || { price: 0, mrp: 0, specifications: [] };
  const price = variant.price;
  const originalPrice = variant.mrp || price;
  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;
  const rating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
      product.reviews.length
      : 0;
  const ratings = product.reviews.length;

  // Comparison store
  const { addProduct, removeProduct, isSelected } = useCompareStore();
  const selected = isSelected(product.id);

  const handleCompareToggle = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (selected) {
      removeProduct(product.id);
      toast.success("Removed from comparison");
    } else {
      const added = addProduct(product as any);
      if (added) {
        toast.success("Added to comparison");
      } else {
        toast.error("Maximum 4 products can be compared");
      }
    }
  };

  return (
    <div className={`group relative flex w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg hover:shadow-md transition-all duration-300 overflow-hidden ${selected ? "ring-1 ring-blue-500 border-blue-500" : ""
      }`}>
      <Link href={`/product/${product.slug}`} className="flex w-full min-h-[140px] sm:min-h-[160px]">
        {/* LEFT: Image Section */}
        <div className="relative w-[120px] xs:w-[140px] sm:w-[180px] md:w-[220px] shrink-0 bg-gray-50 dark:bg-gray-800/50 p-3 flex items-center justify-center">
          <div className="relative w-full h-full aspect-square md:aspect-[4/3]">
            <Image
              src={product.images[0]?.url || "/placeholder.svg"}
              alt={product.images[0]?.altText || product.name}
              fill
              sizes="(max-width: 640px) 120px, (max-width: 768px) 180px, 220px"
              className="object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 bg-green-600/90 text-white rounded border-none font-semibold">
              {discount}% OFF
            </Badge>
          )}
        </div>

        {/* RIGHT: Content Section */}
        <div className="flex-1 flex flex-col p-3 sm:p-5 relative">

          {/* Header: Brand & Rating */}
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
            <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide font-medium">
              {product.brand || product.category.name}
            </div>

            {/* Rating - Hidden on very small screens if crowded, visible otherwise */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="bg-green-600 text-white px-1.5 py-0.5 flex items-center gap-1 rounded text-[10px] font-bold">
                {rating > 0 ? rating.toFixed(1) : "New"}
                <Star className="w-2.5 h-2.5 fill-white" />
              </span>
              {ratings > 0 && (
                <span className="text-muted-foreground text-[10px] sm:text-xs hidden xs:inline-block">
                  ({ratings.toLocaleString()})
                </span>
              )}
            </div>
          </div>

          {/* Title - Limit lines */}
          <h3 className="font-medium text-sm sm:text-base md:text-lg text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Specs - Desktop Only */}
          {variant.specifications.length > 0 && (
            <ul className="hidden md:flex flex-wrap gap-x-4 gap-y-1 mb-3 text-xs text-muted-foreground">
              {variant.specifications.slice(0, 3).map((spec, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                  <span className="truncate max-w-[150px]">{spec.value}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex-1" />

          {/* Bottom Row: Price & Actions */}
          <div className="flex items-end justify-between mt-2">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                  {formatPrice(price)}
                </span>
                {originalPrice > price && (
                  <span className="text-xs sm:text-sm text-muted-foreground line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-xs text-green-600 font-medium mt-0.5">
                {product.deliveryOptions?.[0]?.title || "Standard Delivery"}
              </span>
            </div>
          </div>

        </div>
      </Link>

      {/* Compare Checkbox - Absolute Positioned bottom right */}
      <div
        className="absolute bottom-3 right-3 z-20"
        onClick={handleCompareToggle}
      >
        <div className="flex items-center gap-1.5 cursor-pointer bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 backdrop-blur-sm p-1.5 rounded transition-all">
          <Checkbox
            id={`compare-${product.id}`}
            checked={selected}
            className="h-3.5 w-3.5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <label htmlFor={`compare-${product.id}`} className="text-[10px] sm:text-xs font-medium cursor-pointer select-none text-muted-foreground hover:text-foreground">
            Compare
          </label>
        </div>
      </div>
    </div>
  );
}