"use client";

import React, { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import SmartMedia from "@/components/ui/SmartMedia";
import { TProduct } from "@/types/product";
import { Heart, ShoppingCart, Check, Star } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useCart } from "@/hooks/cart/useCart";
import { formatPrice } from "@/lib/utils";
import { useWishlist } from "@/hooks/wishlist/useWishlist";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCompareStore } from "@/store/compareStore";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ProductCardProps {
  product: TProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, checkIsInCart, removeFromCart } = useCart();
  const currentPrice = product.variants?.[0]?.price;
  const originalPrice = product.variants?.[0]?.mrp;

  const defaultImage = product.images?.find((img) => img.mediaType !== "VIDEO")?.url || product.images?.[0]?.url;

  const handleCartAction = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.variants?.[0]) return;

    if (checkIsInCart(product.id)) {
      removeFromCart(product.variants[0].id, product.id);
    } else {
      addToCart(product.variants[0].id, product.id, 1);
    }
  };

  const { isInWishlist, handleAddToWishlist, handleRemoveFromWishlist } = useWishlist();
  const { userId } = useAuth();
  const router = useRouter();

  const checkIsWishlisted = (id: string) => isInWishlist(id);

  const handleWishlistAction = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      router.push("/sign-in");
      return;
    }

    if (checkIsWishlisted(product.id)) {
      await handleRemoveFromWishlist(product.id);
      toast.success("Removed from wishlist");
    } else {
      await handleAddToWishlist(product.id, product);
      toast.success("Added to wishlist");
    }
  };

  // Comparison store
  const { addProduct, removeProduct, isSelected } = useCompareStore();
  const selected = isSelected(product.id);

  const handleCompareToggle = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (selected) {
      removeProduct(product.id);
      toast.success("Removed from comparison");
    } else {
      const added = addProduct(product as any);
      if (added) {
        toast.success("Added to comparison");
      } else {
        toast.error("Maximum 4 products can be compared");
      }
    }
  };

  const discount =
    currentPrice && originalPrice && Number(originalPrice) > Number(currentPrice)
      ? Math.round(((Number(originalPrice) - Number(currentPrice)) / Number(originalPrice)) * 100)
      : 0;

  const averageRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / product.reviews.length
      : 0;

  return (
    <div className="block w-full h-full relative">
      <Link href={`/product/${product.slug}`} className="block h-full">
        <Card className={`group cursor-pointer hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl h-full flex flex-col overflow-hidden min-h-[260px] p-0 ${selected ? "ring-2 ring-blue-500 border-blue-500" : ""
          }`}>
          <CardContent className="p-0 flex flex-col h-full">
            {/* Image Section - Fixed Aspect Ratio */}
            <div className="relative w-full aspect-[3/2] bg-gray-50 dark:bg-gray-800 flex-shrink-0 overflow-hidden">
              <SmartMedia
                src={defaultImage}
                alt={product.name}
                fill
                className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              {/* Discount Badge */}
              {discount > 0 && (
                <Badge className="absolute top-3 left-3 text-xs px-2 py-0.5 bg-green-600 text-white rounded-md border-none shadow-sm font-semibold z-10">
                  {discount}% OFF
                </Badge>
              )}

              {/* Quick Actions Overlay (Desktop) */}
              <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 opacity-100 sm:opacity-0 sm:translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                <Button
                  size="icon"
                  variant="secondary"
                  className={`h-8 w-8 rounded-full shadow-sm bg-white/95 hover:bg-white ${checkIsWishlisted(product.id) ? "text-red-500" : "text-gray-600"}`}
                  onClick={handleWishlistAction}
                >
                  <Heart className={`h-4 w-4 ${checkIsWishlisted(product.id) ? "fill-current" : ""}`} />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className={`h-8 w-8 rounded-full shadow-sm bg-white/95 hover:bg-white ${checkIsInCart(product.id) ? "text-green-600" : "text-gray-600"}`}
                  onClick={handleCartAction}
                >
                  {checkIsInCart(product.id) ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Details Section */}
            <div className="flex-1 flex flex-col p-2 sm:p-2.5 gap-1">
              {/* Brand */}
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">
                {typeof product.brand === 'string' ? product.brand : product.brand?.name || 'Generic'}
              </div>

              {/* Title */}
              <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors min-h-[2.5em]">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-1.5">
                <span className="bg-green-600 text-white px-1.5 py-0.5 flex items-center gap-0.5 rounded text-[10px] sm:text-xs font-bold">
                  {averageRating > 0 ? averageRating.toFixed(1) : "New"}
                  <Star className="w-2.5 h-2.5 fill-white" />
                </span>
                {product.reviews && product.reviews.length > 0 && (
                  <span className="text-muted-foreground text-[10px] sm:text-xs">
                    ({product.reviews.length})
                  </span>
                )}
              </div>

              <div className="flex-1" />

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <div className="text-base sm:text-lg font-bold text-foreground">
                  {formatPrice(Number(currentPrice || 0))}
                </div>
                {originalPrice && Number(originalPrice) > Number(currentPrice) && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(Number(originalPrice))}
                  </span>
                )}
              </div>

              {/* Free Delivery - Optional, can toggle based on product data if available */}
              <div className="text-[10px] text-green-600 font-medium">
                Free delivery
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Compare Checkbox */}
      <div
        className="absolute bottom-1 right-1 z-10"
        onClick={handleCompareToggle}
      >
        <div className="flex items-center gap-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded border border-border shadow-sm px-2 py-1 hover:bg-background transition-colors cursor-pointer">
          <Checkbox
            id={`compare-${product.id}`}
            checked={selected}
            className="h-3.5 w-3.5"
          />
          <label
            htmlFor={`compare-${product.id}`}
            className="text-[7px] sm:text-xs font-medium cursor-pointer select-none"
          >
            Compare
          </label>
        </div>
      </div>
    </div>
  );
}