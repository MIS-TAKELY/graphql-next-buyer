import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@radix-ui/react-label";
import { ShieldCheck, Star } from "lucide-react";
import { NextRouter } from "next/router";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  rating: number;
  ratings: number;
  reviews: number;
  category: string;
  brand: string;
  inStock: boolean;
  assured: boolean;
  specs: string[];
  slug:string
  description: string; // Added description field
  stockInfo: string;
  stockColor: string;
  exchangeInfo: string;
  exchangeColor: string;
  network: string;
  publishedDate: string;
}

interface ProductCardProps {
  product: Product;
  router: NextRouter;
}

export default function ProductCard({ product, router }: ProductCardProps) {
  // console.log("products-->", product);
  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-shadow bg-gray-900 border-gray-800"
      onClick={() => router.push(`/product/${product.slug}`)}
    >
      <CardContent className="p-4 flex gap-4">
        <div className="relative w-32 h-32 flex-shrink-0 bg-gray-900 rounded-lg overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-600 text-white text-xs">
              {product.discount}% OFF
            </Badge>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-4 mb-2">
            <div className="flex-1">
              <h3 className="font-medium text-white line-clamp-2 mb-2">
                {product.name}
              </h3>
              {product.rating > 0 && (
                <div className="flex items-center gap-2 text-sm mb-3">
                  <span className="bg-green-600 text-white px-2 py-0.5 rounded flex items-center gap-1">
                    {product.rating}
                    <Star className="w-3 h-3 fill-white" />
                  </span>
                  <span className="text-gray-400">
                    ({product.ratings.toLocaleString()})
                  </span>
                  {product.assured && (
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                  )}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-xl font-semibold text-white">
                $
                {product.price.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
              {product.originalPrice > product.price && (
                <div className="text-sm text-gray-500 line-through">
                  $
                  {product.originalPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Added description section (clamped to 3 lines for brevity in card view) */}
          {product.description && (
            <p className="text-sm text-gray-300 mb-3 line-clamp-3">
              {product.description}
            </p>
          )}

          {product.specs.length > 0 && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3 text-xs text-gray-400">
              {product.specs.slice(0, 4).map((spec, idx) => (
                <div key={idx} className="flex items-start gap-1">
                  <span>•</span>
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-gray-800">
            <div className="flex gap-2 text-xs">
              {product.stockInfo && (
                <span className={product.stockColor}>{product.stockInfo}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Checkbox
                id={`compare-${product.id}`}
                onClick={(e) => e.stopPropagation()}
                className="border-gray-600"
              />
              <Label
                htmlFor={`compare-${product.id}`}
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
  );
}
