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
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
          <div className="flex" role="img" aria-label={`${productData.avgRating} stars`}>
            <span className="text-amber-400 text-xs">★</span>
          </div>
          <span className="font-medium text-foreground">{productData.avgRating.toFixed(1)}</span>
          <span className="text-[9px] text-muted-foreground">({productData.reviewCount})</span>
        </div>
      );
    }, [productData]);

    return (
      <Card className="h-full bg-card border border-border/20 shadow-sm hover:shadow-lg transition-shadow duration-200 group overflow-hidden rounded-none flex flex-col">
        <CardContent className="p-0 flex flex-col h-full">
          <Link href={`/product/${product.slug}`} className="cursor-pointer block relative flex-grow">
            {/* Discount Badge */}
            {productData.mrp > productData.price && (
              <div className="absolute top-2 left-2 z-10 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 shadow-sm">
                {Math.round(((productData.mrp - productData.price) / productData.mrp) * 100)}% OFF
              </div>
            )}

            {/* Image Container - Full width, no padding */}
            <div className="aspect-square relative bg-white overflow-hidden">
              <Image
                src={productData.imageUrl}
                alt={productData.imageAlt}
                fill
                sizes={sizes}
                priority={priority}
                className="object-contain p-4"
              />
            </div>

            <div className="p-3 flex flex-col gap-1.5">
              <h3 className="font-medium text-[13px] sm:text-sm text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {product.name}
              </h3>

              <div className="flex items-center gap-2">
                {/* Green Star Rating Badge */}
                {productData.hasReviews && (
                  <div className="flex items-center gap-1 bg-green-700 text-white px-1.5 py-0.5 rounded-[2px] text-[10px] font-bold">
                    <span>{productData.avgRating.toFixed(1)}</span>
                    <span className="text-[10px]">★</span>
                  </div>
                )}
                {productData.hasReviews && (
                  <span className="text-[10px] text-muted-foreground font-medium">({productData.reviewCount})</span>
                )}
              </div>

              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-bold text-base text-foreground">
                  {formatPrice(productData.price)}
                </span>
                {productData.mrp > productData.price && (
                  <span className="text-xs text-muted-foreground line-through decoration-destructive/50">
                    {formatPrice(productData.mrp)}
                  </span>
                )}
                {productData.mrp > productData.price && (
                  <span className="text-[10px] text-green-700 dark:text-green-400 font-bold">
                    {Math.round(((productData.mrp - productData.price) / productData.mrp) * 100)}% off
                  </span>
                )}
              </div>

              {/* Optional: Add "Free delivery" or "Saver Deal" text if needed here */}

            </div>
          </Link>

          <div className="px-3 pb-3 mt-auto">
            {/* Use variants or size to make it compact */}
            <AddToCartButton
              productId={product.id}
              variantId={productData.variantId}
              inStock={product.status === "ACTIVE" || product.status === "available"}
              className="!bg-white dark:!bg-gray-800 !text-primary border border-primary hover:!bg-primary/5 text-xs h-8 py-0 font-medium w-full"
              size="sm"
            />
          </div>
        </CardContent>
      </Card>
    );
  }
);

ProductCard.displayName = "ProductCard";

export default ProductCard;
