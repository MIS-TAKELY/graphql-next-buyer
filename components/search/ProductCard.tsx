import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@radix-ui/react-label";
import { Star } from "lucide-react";
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

interface Image {
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
  images: Image[];
  reviews: Review[];
  description: string;
  brand: string;
  slug: string;
  category: Category;
}

interface ProductCardProps {
  product: SearchProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const variant = product.variants[0] || { price: 0, mrp: 0, specifications: [] };
  const price = variant.price;
  const originalPrice = variant.mrp || price;
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const rating = product.reviews.length > 0
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0;
  const ratings = product.reviews.length;
  const productId = product.slug;

  return (
    <Link href={`/product/${product.slug}`} className="block w-full">
      <Card className="group cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-4 flex flex-row gap-4">
          <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <img
              src={product.images[0]?.url || "/placeholder-image.jpg"}
              alt={product.images[0]?.altText || product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {discount > 0 && (
              <Badge className="absolute top-1 left-1 text-xs bg-red-600 text-white">
                {discount}% OFF
              </Badge>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-row justify-between gap-4 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 mb-2">{product.name}</h3>
                {rating > 0 && (
                  <div className="flex items-center gap-2 text-xs mb-2">
                    <span className="bg-green-600 text-white px-1.5 py-0.5 rounded flex items-center gap-1">
                      {rating.toFixed(1)}
                      <Star className="w-3 h-3 fill-white" />
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">({ratings.toLocaleString()})</span>
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatPrice(price)}
                </div>
                {originalPrice > price && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 line-through">
                    {formatPrice(originalPrice)}
                  </div>
                )}
              </div>
            </div>
            {product.description && (
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">{product.description}</p>
            )}
            {variant.specifications.length > 0 && (
              <div className="grid grid-cols-1 gap-y-1 gap-x-3 mb-2 text-xs text-gray-600 dark:text-gray-400">
                {variant.specifications.slice(0, 4).map((spec, idx) => (
                  <div key={idx} className="flex items-start gap-1 truncate">
                    <span>•</span>
                    <span className="truncate">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
              <div className="flex gap-2 text-xs">
                {/* Stock info omitted since not in SearchProduct */}
              </div>
              <div className="flex items-center gap-1">
                <Checkbox
                  id={`compare-${productId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="border-gray-300 dark:border-gray-600 h-4 w-4"
                />
                <Label
                  htmlFor={`compare-${productId}`}
                  className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  Compare
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}