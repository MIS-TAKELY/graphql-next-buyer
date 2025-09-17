// components/page/product/ProductInfo.tsx
import { memo } from "react";
import { Star } from "lucide-react";

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
  // Format price properly
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Get review count
  const reviewCount = product.reviews?.length || 0;

  return (
    <div className="space-y-6">
      {/* Product Title & Status */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          {product.status === 'ACTIVE' && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              Available
            </span>
          )}
        </div>
        
        {/* Category & Brand */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          {product.category?.name && (
            <span className="capitalize">{product.category.name}</span>
          )}
          {product.brand?.name && (
            <>
              <span>•</span>
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
                    i < Math.floor(averageRating) ? "text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-medium">
              ({averageRating > 0 ? averageRating.toFixed(1) : '0.0'})
            </span>
            {reviewCount > 0 && (
              <span className="text-gray-500 ml-1">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
            )}
          </div>
          
          <span className="text-gray-600">|</span>
          
          <span className={`font-medium ${inStock ? 'text-green-600' : 'text-red-600'}`}>
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      </div>

      {/* Price Display */}
      <div className="flex items-center gap-4">
        {defaultVariant?.price ? (
          <span className="text-3xl font-bold text-gray-900">
            {formatPrice(defaultVariant.price)}
          </span>
        ) : (
          <span className="text-2xl font-medium text-gray-500">
            Price not available
          </span>
        )}
        
        {/* Stock quantity if available */}
        {defaultVariant?.stock && (
          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {defaultVariant.stock} units available
          </span>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <div>
          <p className="text-gray-700 text-lg leading-relaxed">
            {product.description}
          </p>
        </div>
      )}

      {/* Placeholder for features - you can populate this with actual data */}
      {/* <div className="border-t pt-4">
        <h3 className="font-semibold text-lg mb-3">Product Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium capitalize">{product.status.toLowerCase()}</span>
          </div>
          {product.category?.name && (
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium capitalize">{product.category.name}</span>
            </div>
          )}
          {product.brand?.name && (
            <div className="flex justify-between">
              <span className="text-gray-600">Brand:</span>
              <span className="font-medium">{product.brand.name}</span>
            </div>
          )}
          {product.variants && product.variants.length > 1 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Variants:</span>
              <span className="font-medium">{product.variants.length} available</span>
            </div>
          )}
        </div>
      </div> */}
    </div>
  );
});

export default ProductInfo;