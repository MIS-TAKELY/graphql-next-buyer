"use client";

import { ADD_TO_CART, REMOVE_FROM_CART } from "@/client/cart/cart.mutations";
import { GET_CART_PRODUCT_IDS } from "@/client/cart/cart.queries";
import { useCart } from "@/components/page/home/ClientCartProvider"; // Updated import
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation } from "@apollo/client";
import { Check, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type ProductImage = { url: string; altText?: string | null };
type ProductVariant = { id: string; price: string };
type ProductReview = { rating?: number | null };

export interface IProduct {
  id: string;
  name: string;
  slug?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  reviews?: ProductReview[];
}

type CartStatus =
  | "idle"
  | "adding"
  | "removing"
  | "added"
  | "removed"
  | "error";

const ProductCard: React.FC<{ product: IProduct }> = ({ product }) => {
  const cartCtx = useCart();
  const cartItems = cartCtx?.cartItems ?? new Set<string>();
  const cartLoading = !!cartCtx?.loading;

  const [status, setStatus] = useState<CartStatus>("idle");
  const [isHovered, setIsHovered] = useState(false);
  const [optimisticCartItems, setOptimisticCartItems] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    setOptimisticCartItems(cartItems);
  }, [cartItems]);

  const [addToCart] = useMutation(ADD_TO_CART, {
    refetchQueries: [{ query: GET_CART_PRODUCT_IDS }],
    onCompleted: () => {
      setStatus("added");
      toast.success("Added to cart 🛒");
      setTimeout(() => setStatus("idle"), 1500);
    },
    onError: () => {
      toast.error("Failed to add. Try again.");
      setStatus("error");
      setOptimisticCartItems(cartItems);
      setTimeout(() => setStatus("idle"), 2000);
    },
  });

  const [removeFromCart] = useMutation(REMOVE_FROM_CART, {
    refetchQueries: [{ query: GET_CART_PRODUCT_IDS }],
    onCompleted: () => {
      setStatus("removed");
      toast("Removed from cart", { icon: "🗑️" });
      setTimeout(() => setStatus("idle"), 1500);
    },
    onError: () => {
      toast.error("Failed to remove. Try again.");
      setStatus("error");
      setOptimisticCartItems(cartItems);
      setTimeout(() => setStatus("idle"), 2000);
    },
  });

  const productData = useMemo(() => {
    const imageUrl = product.images?.[0]?.url ?? "/placeholder.svg";
    const imageAlt =
      product.images?.[0]?.altText ?? product.name ?? "Product image";
    const variantId = product.variants?.[0]?.id;
    const price = parseFloat(product.variants?.[0]?.price ?? "0");
    const avgRating = product.reviews?.length
      ? product.reviews.reduce((s, r) => s + (r.rating ?? 0), 0) /
        product.reviews.length
      : 0;

    return { imageUrl, imageAlt, variantId, price, avgRating };
  }, [product]);

  const isInCart = optimisticCartItems.has(product.id);
  const isLoading = status === "adding" || status === "removing" || cartLoading;
  const isDisabled = !productData.variantId || isLoading;

  const handleAdd = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isDisabled) return;

      setOptimisticCartItems((prev) => new Set([...prev, product.id]));
      setStatus("adding");

      try {
        await addToCart({
          variables: { variantId: productData.variantId, quantity: 1 },
        });
      } catch {}
    },
    [isDisabled, addToCart, productData.variantId, product.id]
  );

  const handleRemove = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isDisabled) return;

      const newSet = new Set(optimisticCartItems);
      newSet.delete(product.id);
      setOptimisticCartItems(newSet);
      setStatus("removing");

      try {
        await removeFromCart({
          variables: { variantId: productData.variantId },
        });
      } catch {}
    },
    [
      isDisabled,
      removeFromCart,
      productData.variantId,
      product.id,
      optimisticCartItems,
    ]
  );

  return (
    <Link href={`/product/${product.slug}`} className="block h-full group">
      <Card className="h-full hover:shadow-lg transition-transform duration-200 group-hover:scale-[1.01] border-0 shadow-sm">
        <CardContent className="p-3 flex flex-col h-full">
          <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-50 relative group">
            <Image
              src={productData.imageUrl}
              alt={productData.imageAlt}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              placeholder="blur"
              blurDataURL="/tiny-placeholder.jpg"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-medium text-sm mb-2 line-clamp-2 text-black group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
              {productData.avgRating > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className={
                          i < Math.round(productData.avgRating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span>({productData.avgRating.toFixed(1)})</span>
                </div>
              )}
              <div className="font-bold text-lg text-gray-700">
                ${productData.price.toFixed(2)}
              </div>
            </div>
            <div className="mt-3">
              <Button
                size="sm"
                variant={isInCart ? "outline" : "default"}
                onClick={isInCart ? handleRemove : handleAdd}
                disabled={isDisabled}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`w-full transition-all duration-200 active:scale-95 ${
                  isInCart
                    ? "border-gray-400 text-gray-600 hover:bg-red-50 hover:border-red-500 hover:text-red-600"
                    : "bg-white hover:bg-gray-100 text-black"
                }`}
              >
                <span className="flex items-center justify-center gap-2 min-w-[100px]">
                  {isInCart ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <ShoppingCart className="w-4 h-4" />
                  )}
                  <span>
                    {isLoading
                      ? isInCart
                        ? "Removing..."
                        : "Adding..."
                      : isInCart
                      ? isHovered
                        ? "Remove"
                        : "In Cart"
                      : "Add to Cart"}
                  </span>
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
