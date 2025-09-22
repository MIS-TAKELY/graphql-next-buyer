import { ICartItem } from "@/app/(main)/cart/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

  const formatPrice = (priceInCents: number) =>
    `$${(priceInCents / 100).toFixed(2)}`;
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-shrink-0 w-full sm:w-32 lg:w-40">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={product.images[0]?.url || "/placeholder.svg"}
                alt={product.images[0]?.altText || product.name}
                width={160}
                height={160}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <div className="flex-1">
                <Link href={`/product/${product.slug}`}>
                  <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>

                <div className="space-y-2 text-sm text-gray-600">
                  {product.description && <p>{product.description}</p>}
                  {variant.sku && (
                    <p>
                      <span className="font-medium">SKU:</span> {variant.sku}
                    </p>
                  )}
                </div>

                {/* Mobile Price & Actions */}
                <div className="sm:hidden mt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">
                      {formatPrice(variant.price)}
                    </span>
                    {variant.attributes?.comparePrice && (
                      <>
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(variant.attributes.comparePrice)}
                        </span>
                        {discount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {discount}% OFF
                          </Badge>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => updateQuantity(item.id, quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="px-3 py-1 text-sm font-medium">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => updateQuantity(item.id, quantity + 1)}
                        disabled={quantity >= variant.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(product.id, variant.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Desktop Price & Actions */}
              <div className="hidden sm:flex flex-col items-end gap-4">
                <div className="text-right">
                  <div className="text-xl font-bold">
                    {formatPrice(variant.price)}
                  </div>
                  {variant.attributes?.comparePrice && (
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(variant.attributes.comparePrice)}
                      </span>
                      {discount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {discount}% OFF
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => updateQuantity(item.id, quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="px-3 py-1 text-sm font-medium">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => updateQuantity(item.id, quantity + 1)}
                      disabled={quantity >= variant.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(product.id, variant.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartItem;
