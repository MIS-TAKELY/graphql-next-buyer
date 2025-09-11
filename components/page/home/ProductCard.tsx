"use client";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { AddToCartButton } from "@/components/common";

export interface IImages {
  altText?: string;
  url: string;
}

export interface IReview {
  rating: number; // Changed to number for better type safety
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

const ProductCard: React.FC<{ product: IProduct }> = ({ product }) => {
  // console.log("products-->", product);

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
  return (
    <Card className="h-full hover:shadow-lg transition-transform duration-200 hover:scale-[1.01] border-0 shadow-sm">
      <CardContent className="p-3 flex flex-col h-full">
        <Link href={`/product/${product.slug}`} className="block group flex-1">
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
              <h5 className="font-small text-xs mb-2 text-gray-600 line-clamp-2">
                {product.description}
              </h5>

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
          </div>
        </Link>

        {/* Button outside the clickable Link area */}
        <div className="mt-3">
          <AddToCartButton
            productId={product.id}
            variantId={productData.variantId}
            inStock={true}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
