"use client";
import { AddToCartButton } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { memo, useMemo } from "react";

export interface IImages {
  altText?: string;
  url: string;
}

export interface IReview {
  rating: number;
}

export interface IVarient {
  id: string;
  price: string;
}

export interface IProduct {
  description: string;
  id: string;
  images: IImages[];
  name: string;
  reviews: IReview[];
  slug: string;
  status: string;
  variants: IVarient[];
}

interface ProductCardProps {
  product: IProduct;
  priority?: boolean; // For above-the-fold images
  sizes?: string; // Custom image sizes
}

const ProductCard = memo<ProductCardProps>(
  ({
    product,
    priority = false,
    sizes = "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw",
  }) => {
    // Memoize heavy calculations
    const productData = useMemo(() => {
      const firstImage = product.images?.[0];
      const firstVariant = product.variants?.[0];
      const reviews = product.reviews;

      return {
        imageUrl: firstImage?.url ?? "/placeholder.svg",
        imageAlt: firstImage?.altText ?? product.name ?? "Product image",
        variantId: firstVariant?.id,
        price: firstVariant ? parseFloat(firstVariant.price) : 0,
        avgRating: reviews?.length
          ? reviews.reduce((sum, review) => sum + (review.rating ?? 0), 0) /
            reviews.length
          : 0,
        reviewCount: reviews?.length ?? 0,
        hasReviews: (reviews?.length ?? 0) > 0,
      };
    }, [product.images, product.variants, product.reviews, product.name]);

    // Memoize star rating component to prevent re-renders
    const starRating = (() => {
      if (!productData.hasReviews) return null;

      return (
        <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
          <div
            className="flex"
            role="img"
            aria-label={`${productData.avgRating} stars`}
          >
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
      );
    }, [productData.avgRating, productData.hasReviews]);

    return (
      <Card className="h-full hover:shadow-lg transition-transform duration-200 hover:scale-[1.01] border-0 shadow-sm">
        <CardContent className="p-3 flex flex-col h-full">
          <Link
            href={`/product/${product.slug}`}
            className="block group flex-1"
            prefetch={false} // Only prefetch on hover/focus
          >
            <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-50 relative group">
              <Image
                src={productData.imageUrl}
                alt={productData.imageAlt}
                fill
                sizes={sizes}
                className="object-cover transition-transform duration-200 group-hover:scale-105"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                priority={priority}
                loading={priority ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-medium text-sm mb-2 line-clamp-2 text-black group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                <p className="font-small text-xs mb-2 text-gray-600 line-clamp-2">
                  {product.description}
                </p>

                {starRating}

                <div className="font-bold text-lg text-gray-700">
                  ${productData.price.toFixed(2)}
                </div>
              </div>
            </div>
          </Link>

          {/* Button outside the clickable Link area */}
          <div className="mt-3">
            <AddToCartButton
              productId={product.id}
              variantId={productData.variantId}
              inStock={
                product.status === "ACTIVE" || product.status === "available"
              }
            />
          </div>
        </CardContent>
      </Card>
    );
  }
);

ProductCard.displayName = "ProductCard";

export default ProductCard;
