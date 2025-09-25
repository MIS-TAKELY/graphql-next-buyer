// components/page/product/ProductInfo.tsx
import { Star } from "lucide-react";
import { memo } from "react";

interface ProductInfoProps {
  product: {
    id: string;
    name: string;
    description: string;
    status: string;
    variants?: Array<{
      id: string;
      price: string;
      stock?: number;
      isDefault?: boolean;
    }>;
    reviews?: Array<{
      rating: number;
    }>;
    category?: { name: string };
    brand?: { name: string };
  };
  averageRating: number;
  inStock: boolean;
  defaultVariant: any;
}

const ProductInfo = memo(function ProductInfo({
  product,
  averageRating,
  inStock,
  defaultVariant,
}: ProductInfoProps) {
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return numPrice
      .toLocaleString("en-NP", {
        style: "currency",
        currency: "NPR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      .replace("NPR", "रु");
  };

  const reviewCount = product.reviews?.length || 0;

  return (
    <div className="space-y-6">
      {/* Product Title & Status */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {product.name}
          </h1>
          {product.status === "ACTIVE" && (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
              Available
            </span>
          )}
        </div>

        {/* Category & Brand */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
          {product.category?.name && (
            <span className="capitalize">{product.category.name}</span>
          )}
          {product.brand?.name && (
            <>
              <span className="text-gray-500 dark:text-gray-400">•</span>
              <span>{product.brand.name}</span>
            </>
          )}
        </div>

        {/* Rating & Stock Status */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 fill-current ${
                    i < Math.floor(averageRating)
                      ? "text-yellow-400 dark:text-yellow-300"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-medium text-gray-900 dark:text-white">
              ({averageRating > 0 ? averageRating.toFixed(1) : "0.0"})
            </span>
            {reviewCount > 0 && (
              <span className="text-gray-500 dark:text-gray-400 ml-1">
                ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
              </span>
            )}
          </div>

          <span className="text-gray-500 dark:text-gray-400">|</span>

          <span
            className={`font-medium ${
              inStock
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      </div>

      {/* Price Display */}
      <div className="flex items-center gap-4">
        {defaultVariant?.price ? (
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatPrice(defaultVariant.price)}
          </span>
        ) : (
          <span className="text-2xl font-medium text-gray-500 dark:text-gray-400">
            Price not available
          </span>
        )}

        {defaultVariant?.stock && (
          <span className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {defaultVariant.stock} units available
          </span>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <div>
          <p className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed">
            {product.description}
          </p>
        </div>
      )}
    </div>
  );
});

export default ProductInfo;
