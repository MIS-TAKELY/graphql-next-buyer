"use client";
import { AddToCartButton } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
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
    sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1366px) 33vw, (max-width: 1536px) 25vw, 20vw",
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
        <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
          <div className="flex" role="img" aria-label={`${productData.avgRating} stars`}>
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={
                  i < Math.round(productData.avgRating)
                    ? "text-rating"
                    : "text-muted-foreground opacity-50"
                }
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-xs">({productData.avgRating.toFixed(1)})</span>
        </div>
      );
    }, [productData]);

    return (
      <Card className="h-full card-shadow border-border bg-card hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
        <CardContent className="p-2 xs:p-3 flex flex-col h-full">
          <Link href={`/product/${product.slug}`} className="flex-1 group block">
            <div className="aspect-square mb-2 xs:mb-3 overflow-hidden rounded-lg bg-muted relative group">
              <Image
                src={productData.imageUrl}
                alt={productData.imageAlt}
                fill
                sizes={sizes}
                unoptimized
                priority={priority}
                className="object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </div>

            <h3 className="font-medium text-xs xs:text-sm mb-1 line-clamp-2 text-card-foreground group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
              {product.description}
            </p>

            {starRating}

            <div className="flex items-center gap-2 flex-wrap mt-1">
              <span className="font-bold text-base text-price">
                रु{productData.price.toFixed(2)}
              </span>

              {productData.mrp > productData.price && (
                <>
                  <span className="text-xs line-through text-price-original">
                    रु{productData.mrp.toFixed(2)}
                  </span>
                  <span className="text-xs font-medium text-success">
                    {Math.round(((productData.mrp - productData.price) / productData.mrp) * 100)}% off
                  </span>
                </>
              )}
            </div>
          </Link>

          <div className="mt-2">
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
