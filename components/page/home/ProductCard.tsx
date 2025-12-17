"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import SmartMedia from "@/components/ui/SmartMedia";
import { TProduct } from "@/types/product";
import { Heart, ShoppingCart, Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useCart } from "@/hooks/cart/useCart";
import { formatPrice } from "@/lib/utils";
import { useWishlist } from "@/hooks/wishlist/useWishlist";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: TProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, checkIsInCart, removeFromCart } = useCart();
  const currentPrice = product.variants?.[0]?.price;
  const originalPrice = product.variants?.[0]?.mrp;

  // Try to find default image, or first image
  const defaultImage = product.images?.find((img) => img.mediaType !== "VIDEO")?.url || product.images?.[0]?.url;

  const handleCartAction = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.variants?.[0]) return;

    if (checkIsInCart(product.id)) {
      removeFromCart(product.variants[0].id, product.id);
      // Toast handeled in hook
    } else {
      addToCart(product.variants[0].id, product.id, 1);
      // Toast handled in hook
    }
  };

  const { isInWishlist, handleAddToWishlist, handleRemoveFromWishlist } = useWishlist();
  const { userId } = useAuth();
  const router = useRouter();

  const checkIsWishlisted = (id: string) => isInWishlist(id);

  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

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

  return (
    <Link href={`/product/${product.slug}`} className="group relative block h-full">
      <div className="relative rounded-2xl border bg-card p-3 transition-all duration-300 hover:shadow-lg h-full flex flex-col">
        {/* Discount Badge */}
        {currentPrice && originalPrice && Number(originalPrice) > Number(currentPrice) && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold text-white">
            {Math.round(((Number(originalPrice) - Number(currentPrice)) / Number(originalPrice)) * 100)}% OFF
          </span>
        )}

        {/* Image Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
          <SmartMedia
            src={defaultImage}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 33vw"
          />

          {/* Quick Actions Overlay - Desktop */}
          <div className="absolute right-3 top-3 z-20 flex translate-x-10 flex-col gap-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            <Button
              size="icon"
              variant="secondary"
              className={`h-8 w-8 rounded-full shadow-md bg-white/90 hover:bg-white cursor-pointer ${checkIsWishlisted(product.id) ? "text-red-500 bg-red-50 hover:bg-red-100" : "text-gray-700"
                }`}
              onClick={handleWishlistAction}
            >
              <Heart className={`h-4 w-4 ${checkIsWishlisted(product.id) ? "fill-current" : ""}`} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className={`h-8 w-8 rounded-full shadow-md bg-white/90 hover:bg-white cursor-pointer ${checkIsInCart(product.id) ? "text-green-600 bg-green-50 hover:bg-green-100" : "text-gray-700"
                }`}
              onClick={handleCartAction}
            >
              {checkIsInCart(product.id) ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Product Details */}
        <div className="mt-4 space-y-2 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-1">
            <div>
              <h3 className="line-clamp-2 text-sm font-medium text-foreground min-h-[40px]" title={product.name}>
                {product.name}
              </h3>
              {/* Brand Name */}
              <p className="text-xs text-muted-foreground mt-1">
                {typeof product.brand === 'string' ? product.brand : product.brand?.name || 'Generic'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-auto">
            <p className="text-lg font-bold text-primary">
              {formatPrice(Number(currentPrice))}
            </p>
            {originalPrice && Number(originalPrice) > Number(currentPrice) && (
              <p className="text-xs text-muted-foreground line-through">
                {formatPrice(Number(originalPrice))}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}