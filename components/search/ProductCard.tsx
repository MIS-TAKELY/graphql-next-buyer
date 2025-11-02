import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@radix-ui/react-label";
import { Star } from "lucide-react";
import Link from "next/link";

// Define interfaces based on GraphQL query structure
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
  // Extract data from the first variant, with fallbacks
  const variant = product.variants[0] || { price: 0, mrp: 0, specifications: [] };
  const price = variant.price;
  const originalPrice = variant.mrp || price;
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  
  // Calculate rating as average of reviews
  const rating = product.reviews.length > 0
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0;
  const ratings = product.reviews.length;

  // Use slug for unique identifier
  const productId = product.slug;

  return (
    <Link href={`/product/${product.slug}`} className="block w-full">
      <Card className="group cursor-pointer hover:shadow-lg transition-shadow bg-gray-900 border-gray-800">
        <CardContent className="p-4 flex gap-4">
          <div className="relative w-32 h-32 flex-shrink-0 bg-gray-900 rounded-lg overflow-hidden">
            <img
              src={product.images[0]?.url || "/placeholder-image.jpg"}
              alt={product.images[0]?.altText || product.name}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <Badge className="absolute top-2 left-2 bg-red-600 text-white text-xs">
                {discount}% OFF
              </Badge>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between gap-4 mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-white line-clamp-2 mb-2">{product.name}</h3>
                {rating > 0 && (
                  <div className="flex items-center gap-2 text-sm mb-3">
                    <span className="bg-green-600 text-white px-2 py-0.5 rounded flex items-center gap-1">
                      {rating.toFixed(1)}
                      <Star className="w-3 h-3 fill-white" />
                    </span>
                    <span className="text-gray-400">({ratings.toLocaleString()})</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold text-white">
                  ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
                {originalPrice > price && (
                  <div className="text-sm text-gray-500 line-through">
                    ${originalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                )}
              </div>
            </div>
            {product.description && (
              <p className="text-sm text-gray-300 mb-3 line-clamp-3">{product.description}</p>
            )}
            {variant.specifications.length > 0 && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3 text-xs text-gray-400">
                {variant.specifications.slice(0, 4).map((spec, idx) => (
                  <div key={idx} className="flex items-start gap-1">
                    <span>•</span>
                    <span>{spec.value}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-gray-800">
              <div className="flex gap-2 text-xs">
                {/* Stock info omitted since not in SearchProduct */}
              </div>
              <div className="flex items-center gap-1">
                <Checkbox
                  id={`compare-${productId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="border-gray-600"
                />
                <Label
                  htmlFor={`compare-${productId}`}
                  className="text-xs text-blue-400 cursor-pointer"
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