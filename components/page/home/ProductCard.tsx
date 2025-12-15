"use client";
import { AddToCartButton } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { IProducts } from "@/types/product";
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
          ? reviews.reduce((sum, review) => sum + (review.rating ?? 0), 0) /
          reviews.length
          : 0,
        reviewCount: reviews?.length ?? 0,
        hasReviews: (reviews?.length ?? 0) > 0,
      };
    }, [product]);

    const starRating = useMemo(() => {
      if (!productData.hasReviews) return null;

      return (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
          <div
            className="flex"
            role="img"
            aria-label={`${productData.avgRating} stars`}
          >
            <span className="text-amber-400 text-xs">★</span>
          </div>
          <span className="font-medium text-foreground">
            {productData.avgRating.toFixed(1)}
          </span>
          <span className="text-[9px] text-muted-foreground">
            ({productData.reviewCount})
          </span>
        </div>
      );
    }, [productData]);

    return (
      <Card className="w-full h-full bg-card border border-border shadow-sm hover:shadow-lg transition-shadow duration-200 group overflow-hidden rounded-md flex flex-col">
        <CardContent className="p-0 flex flex-col h-full">
          <Link
            href={`/product/${product.slug}`}
            className="cursor-pointer block relative grow"
          >
            {/* Discount Badge */}
            {productData.mrp > productData.price && (
              <div className="absolute top-2 left-2 z-10 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 shadow-sm">
                {Math.round(
                  ((productData.mrp - productData.price) / productData.mrp) *
                  100
                )}
                % OFF
              </div>
            )}

            {/* Image Container - Fixed aspect ratio */}
            <div className="w-full aspect-[4/3] relative bg-white overflow-hidden">
              <Image
                src={productData.imageUrl}
                alt={productData.imageAlt}
                fill
                sizes={sizes}
                priority={priority}
                className="object-cover"
              />
            </div>

            <div className="p-3 flex flex-col gap-1.5 overflow-hidden">
              <h3 className="font-medium text-[13px] sm:text-sm text-card-foreground line-clamp-2 h-9 sm:h-10 group-hover:text-primary transition-colors">
                {product.name}
              </h3>

              {/* Always render this div with min-height to reserve space for consistency */}
              <div className="flex items-center gap-2 min-h-[20px]">
                {/* Green Star Rating Badge */}
                {productData.hasReviews && (
                  <div className="flex items-center gap-1 bg-green-700 text-white px-1.5 py-0.5 rounded-[2px] text-[10px] font-bold">
                    <span>{productData.avgRating.toFixed(1)}</span>
                    <span className="text-[10px]">★</span>
                  </div>
                )}
                {productData.hasReviews && (
                  <span className="text-[10px] text-muted-foreground font-medium">
                    ({productData.reviewCount})
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1.5 mt-0.5 flex-wrap">
                <span className="font-bold text-sm sm:text-base text-foreground whitespace-nowrap">
                  {formatPrice(productData.price)}
                </span>
                {productData.mrp > productData.price && (
                  <span className="text-[11px] text-muted-foreground line-through decoration-destructive/50 whitespace-nowrap">
                    {formatPrice(productData.mrp)}
                  </span>
                )}
                {productData.mrp > productData.price && (
                  <span className="text-[10px] text-green-700 dark:text-green-400 font-bold whitespace-nowrap">
                    {Math.round(
                      ((productData.mrp - productData.price) /
                        productData.mrp) *
                      100
                    )}
                    % off
                  </span>
                )}
              </div>
            </div>
          </Link>

          <div className="px-3 pb-3 mt-auto">
            <AddToCartButton
              productId={product.id}
              variantId={productData.variantId}
              inStock={
                product.status === "ACTIVE" || product.status === "available"
              }
              className="bg-white! dark:bg-gray-800! text-primary! border border-primary hover:bg-primary/5! text-[10px] sm:text-[11px] h-6 sm:h-7 py-0 font-medium w-full"
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