// components/cart/CartItem.tsx
import { ICartItem } from "@/app/(main)/cart/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import QuantitySelector from "../page/product/QuantitySelector";

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
    <Card className="overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-sm">
      <CardContent className="p-3">
        <div className="flex gap-3">
          {/* Product Image - Fixed Width */}
          <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24">
            <div className="aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden rounded-md border border-gray-100 dark:border-gray-700">
              <Link href={`/product/${product.slug}`}>
                <Image
                  src={product.images[0]?.url || "/placeholder.svg"}
                  alt={product.images[0]?.altText || product.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  quality={85}
                />
              </Link>
            </div>
          </div>

          {/* Product Details & Controls Wrapper */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            {/* Top Row: Title & Remove */}
            <div className="flex justify-between items-start gap-2">
              <Link href={`/product/${product.slug}`} className="flex-1 min-w-0">
                <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white line-clamp-2 leading-tight">
                  {product.name}
                </h3>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 -mt-1 -mr-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                onClick={() => removeItem(product.id, variant.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Middle: Specs or Variant Info (Optional - using price here) */}
            <div className="mt-1">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white">
                  {formatPrice(variant.price)}
                </span>
                {variant.attributes?.comparePrice && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                    {formatPrice(variant.attributes.comparePrice)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-[10px] font-medium text-green-600 dark:text-green-400">
                    {discount}% off
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Row: Quantity & SKU */}
            <div className="flex items-center justify-between mt-3">
              <div className="scale-90 origin-left sm:scale-100">
                <QuantitySelector
                  quantity={quantity}
                  setQuantity={(newQuantity) => updateQuantity(variant.id, newQuantity)}
                />
              </div>

              {/* SKU - Hidden on very small screens, shown on sm+ */}
              {variant.sku && (
                <span className="hidden xs:block text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                  {variant.sku}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartItem;