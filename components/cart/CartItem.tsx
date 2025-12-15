// components/cart/CartItem.tsx
import { ICartItem } from "@/app/(main)/cart/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

const CartItem = ({
  item,
  updateQuantity,
  removeItem,
}: {
  item: ICartItem;
  updateQuantity: (cartId: string, newQuantity: number) => void;
  removeItem: (productId: string, variantId: string) => void;
}) => {
  const { variant, product, quantity } = item;
  const discount = variant.attributes?.comparePrice
    ? Math.round(
      ((variant.attributes.comparePrice - variant.price) /
        variant.attributes.comparePrice) *
      100
    )
    : 0;

  return (
    <Card className="overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-3">
          {/* Product Image - Left */}
          <div className="flex-shrink-0 w-20 sm:w-24">
            <div className="aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden rounded">
              <Link href={`/product/${product.slug}`}>
                <Image
                  src={product.images[0]?.url || "/placeholder.svg"}
                  alt={product.images[0]?.altText || product.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                  loading="lazy"
                  quality={85}
                />
              </Link>
            </div>
          </div>

          {/* Product Info - Middle */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <Link href={`/product/${product.slug}`}>
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 mb-1">
                  {product.name}
                </h3>
              </Link>

              {/* Price and Discount */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  {formatPrice(variant.price)}
                </span>
                {variant.attributes?.comparePrice && (
                  <>
                    <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                      {formatPrice(variant.attributes.comparePrice)}
                    </span>
                    {discount > 0 && (
                      <Badge
                        variant="destructive"
                        className="text-xs bg-green-600 dark:bg-green-500 text-white px-1.5 py-0"
                      >
                        {discount}% OFF
                      </Badge>
                    )}
                  </>
                )}
              </div>

              {/* SKU - Desktop only */}
              {variant.sku && (
                <p className="hidden sm:block text-xs text-gray-600 dark:text-gray-300 mt-1">
                  <span className="font-medium">SKU:</span> {variant.sku}
                </p>
              )}
            </div>
          </div>

          {/* Controls - Right */}
          <div className="flex flex-col items-end justify-between gap-2">
            {/* Quantity Controls */}
            <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => updateQuantity(item.id, quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="px-2 py-1 text-xs font-medium text-gray-900 dark:text-white min-w-[2rem] text-center">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => updateQuantity(item.id, quantity + 1)}
                disabled={quantity >= variant.stock}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Delete Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => removeItem(product.id, variant.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartItem;