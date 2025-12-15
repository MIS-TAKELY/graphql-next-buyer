"use client";

import { AddToCartButton } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EmptyWishlist from "@/components/wiahlist/EmptyWishlist";
import WishlistError from "@/components/wiahlist/WishlistError";
import WishlistSkeleton from "@/components/wiahlist/WishlistSkeleton";
import { useWishlist } from "@/hooks/wishlist/useWishlist";
import { Bell, Heart, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function WishlistSection() {
  const { wishlistItems, loading, error, handleRemoveFromWishlist } =
    useWishlist();

  if (loading && !wishlistItems) return <WishlistSkeleton />;

  if (error) {
    console.error("Wishlist query error:", error);
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500 dark:text-pink-400" />
            My Wishlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WishlistError />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Heart className="h-5 w-5 text-pink-500 dark:text-pink-400 fill-current" />
            My Wishlist
          </CardTitle>
          {wishlistItems.length > 0 && (
            <Badge variant="secondary" className="w-fit">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "item" : "items"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 sm:p-6">
        {wishlistItems.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <div className="divide-y divide-border">
            {wishlistItems.map((item: any) => (
              <div
                key={item.id}
                className="group flex flex-col sm:flex-row gap-4 p-4 sm:p-6 
                  transition-all duration-200 hover:bg-muted/30"
              >
                {/* Product Image */}
                <div className="flex gap-4 flex-1">
                  <div
                    className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 
                    rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 
                    border border-border/50"
                  >
                    {item.product?.images?.[0]?.url ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product?.name || "Product Image"}
                        fill
                        className="object-cover"
                        loading="lazy"
                        sizes="(max-width: 640px) 96px, 112px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3
                      className="font-medium text-base sm:text-lg line-clamp-2 
                      group-hover:text-primary transition-colors"
                    >
                      {item.product?.name || "Unnamed Product"}
                    </h3>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <p className="text-lg font-semibold">
                        ${item.product?.variants?.[0]?.price || "0"}
                      </p>

                      {item.product?.variants?.[0]?.mrp && (
                        <p className="text-sm text-muted-foreground line-through">
                          ${item.product.variants[0].mrp}
                        </p>
                      )}
                    </div>

                    {Number(item.product?.variants?.[0]?.stock || 0) > 0 && (
                      <Badge variant="outline" className="w-fit text-xs">
                        In Stock
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-row sm:flex-col gap-2 sm:justify-center ml-0 sm:ml-4">
                  <AddToCartButton
                    productId={item.product?.id}
                    variantId={item.product?.variants?.[0]?.id}
                    className="flex-1 sm:flex-initial"
                    size="default"
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 flex-1 sm:flex-initial"
                    onClick={() => toast.success("We'll notify you when the price drops!")}
                  >
                    <Bell className="w-4 h-4" />
                    Notify
                  </Button>

                  <Button
                    size="icon"
                    onClick={() =>
                      handleRemoveFromWishlist(
                        item.product?.id,
                        item.wishlistId
                      )
                    }
                    // disabled={removeLoading}
                    className="text-muted-foreground hover:text-destructive 
                      hover:bg-red-700 transition-colors bg-red-600 w-full disabled:opacity-50"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
