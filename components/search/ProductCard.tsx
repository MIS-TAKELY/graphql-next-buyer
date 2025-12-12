import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

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
  name: string;
  variants: Variant[];
  images: ImageType[];
  reviews: Review[];
  description: string;
  brand: string;
  slug: string;
  category: Category;
}

interface ProductCardProps {
  product: SearchProduct;
}

// Mobile-first, Flipkart/Amazon inspired product card with sharp edges
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

  return (
    <Link href={`/product/${product.slug}`} className="block w-full">
      <Card className="group cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-none">
        <CardContent className="p-3 sm:p-4 flex flex-row gap-3 sm:gap-4">
          {/* Product Image - Optimized with Next.js Image */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <Image
              src={product.images[0]?.url || "/placeholder.svg"}
              alt={product.images[0]?.altText || product.name}
              fill
              sizes="(max-width: 640px) 80px, 96px"
              className="object-cover"
              loading="lazy"
            />
            {discount > 0 && (
              <Badge className="absolute top-1 left-1 text-[10px] px-1 py-0 bg-red-600 text-white rounded-none">
                {discount}% OFF
              </Badge>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-row justify-between gap-2 sm:gap-4 mb-1 sm:mb-2">
              <div className="flex-1 min-w-0">
                {/* Product Name - Mobile optimized */}
                <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 mb-1 sm:mb-2">
                  {product.name}
                </h3>

                {/* Rating Badge */}
                {rating > 0 && (
                  <div className="flex items-center gap-1 sm:gap-2 text-xs mb-1 sm:mb-2">
                    <span className="bg-green-600 text-white px-1 py-0.5 flex items-center gap-0.5 rounded-none text-[10px] sm:text-xs">
                      {rating.toFixed(1)}
                      <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" />
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">
                      ({ratings.toLocaleString()})
                    </span>
                  </div>
                )}
              </div>

              {/* Price - Right aligned */}
              <div className="text-right flex-shrink-0">
                <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  {formatPrice(price)}
                </div>
                {originalPrice > price && (
                  <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 line-through">
                    {formatPrice(originalPrice)}
                  </div>
                )}
              </div>
            </div>

            {/* Description - Hidden on very small screens */}
            {product.description && (
              <p className="hidden sm:block text-xs text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Specifications - Compact on mobile */}
            {variant.specifications.length > 0 && (
              <div className="hidden sm:grid grid-cols-1 gap-y-1 gap-x-3 mb-2 text-xs text-gray-600 dark:text-gray-400">
                {variant.specifications.slice(0, 3).map((spec, idx) => (
                  <div key={idx} className="flex items-start gap-1 truncate">
                    <span>•</span>
                    <span className="truncate">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}