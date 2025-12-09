"use client";
import { AddToCartButton } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { IProducts } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

import Link from "next/link";
import { memo, useMemo } from "react";

interface ProductCardProps {
  product: IProducts;
  priority?: boolean;
  sizes?: string;
}

const ProductCard = memo<ProductCardProps>(
  ({
    product,
    priority = false,
    sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, (max-width: 1536px) 20vw, 16vw",
  }) => {
    const productData = useMemo(() => {
      const firstImage = product.images?.[0];
      const firstVariant = product.variants?.[0];
      const reviews = product.reviews;

      return {
        imageUrl: firstImage?.url ?? "/placeholder.svg",
        imageAlt: firstImage?.altText ?? product.name ?? "Product image",
        variantId: firstVariant?.id,
        price: firstVariant ? parseFloat(firstVariant.price) : 0,
        mrp: firstVariant ? parseFloat(firstVariant.mrp) : 0,
        avgRating: reviews?.length
          ? reviews.reduce((sum, review) => sum + (review.rating ?? 0), 0) / reviews.length
          : 0,
        reviewCount: reviews?.length ?? 0,
        hasReviews: (reviews?.length ?? 0) > 0,
      };
    }, [product]);

    const starRating = useMemo(() => {
      if (!productData.hasReviews) return null;

      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <div className="flex" role="img" aria-label={`${productData.avgRating} stars`}>
            <span className="text-amber-400">★</span>
          </div>
          <span className="font-medium text-foreground">{productData.avgRating.toFixed(1)}</span>
          <span className="text-[10px] text-muted-foreground">({productData.reviewCount})</span>
        </div>
      );
    }, [productData]);

    return (
      <Card className="h-full bg-card border border-border/20 shadow-sm hover:shadow-lg transition-shadow duration-200 group overflow-hidden rounded-none">
        <CardContent className="p-0 flex flex-col h-full">
          <Link href={`/product/${product.slug}`} className="flex-1 block relative">
            {/* Discount Badge */}
            {productData.mrp > productData.price && (
              <div className="absolute top-2 left-2 z-10 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 shadow-sm">
                {Math.round(((productData.mrp - productData.price) / productData.mrp) * 100)}% OFF
              </div>
            )}

            <div className="aspect-[4/5] overflow-hidden bg-secondary/20 relative">
              <Image
                src={productData.imageUrl}
                alt={productData.imageAlt}
                fill
                sizes={sizes}
                unoptimized
                priority={priority}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="p-3 sm:p-4 flex flex-col gap-1">
              <h3 className="font-semibold text-sm sm:text-base text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {product.name}
              </h3>

              <div className="min-h-[1.25rem]">
                {starRating}
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-bold text-base sm:text-lg text-primary">
                  {formatPrice(productData.price)}
                </span>
                {productData.mrp > productData.price && (
                  <span className="text-xs text-muted-foreground line-through decoration-destructive/50">
                    {formatPrice(productData.mrp)}
                  </span>
                )}
              </div>
            </div>
          </Link>

          <div className="px-3 sm:px-4 pb-3 sm:pb-4 mt-auto">
            <AddToCartButton
              productId={product.id}
              variantId={productData.variantId}
              inStock={product.status === "ACTIVE" || product.status === "available"}
            />
          </div>
        </CardContent>
      </Card>
    );
  }
);

ProductCard.displayName = "ProductCard";

export default ProductCard;
