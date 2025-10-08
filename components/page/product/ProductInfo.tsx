// components/page/product/ProductInfo.tsx
"use client";

import { TProduct } from "@/types/product";
import { Star } from "lucide-react";
import { memo, useMemo } from "react";
import ShowProductSpecification from "./ShowProductSpecification";

interface ProductInfoProps {
  product: TProduct;
  averageRating: number;
  inStock: boolean;
  defaultVariant: any;
}

const ProductInfo = memo(function ProductInfo({
  product,
  averageRating,
  inStock,
  defaultVariant,
}: ProductInfoProps) {
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return numPrice
      .toLocaleString("en-NP", {
        style: "currency",
        currency: "NPR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      .replace("NPR", "रु");
  };

  const reviewCount = product.reviews?.length || 0;

  const promotionalImages = useMemo(
    () =>
      product?.images?.filter((image) => image.mediaType !== "PRIMARY") || [],
    [product?.images]
  );

  const mrp = defaultVariant?.mrp;
  const price = parseFloat(defaultVariant?.price || "0");
  const hasDiscount = mrp && mrp > price;
  const discountPercent = hasDiscount
    ? Math.round(((mrp - price) / mrp) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Product Title & Status */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {product.name}
          </h1>

          {product.status === "ACTIVE" && (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
              Available
            </span>
          )}
        </div>

        {/* Category & Brand */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          {product.category?.name && (
            <span className="capitalize">{product.category.name}</span>
          )}
          {product.brand?.name && (
            <>
              <span className="text-gray-500 dark:text-gray-400">•</span>
              <span>{product.brand.name}</span>
            </>
          )}
        </div>

        {product.description && (
          <div className="mt-4">
            <p className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        {/* Rating & Stock Status */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 fill-current ${
                    i < Math.floor(averageRating)
                      ? "text-yellow-400 dark:text-yellow-300"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-medium text-gray-900 dark:text-white">
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
            </span>
            {reviewCount > 0 && (
              <span className="text-gray-500 dark:text-gray-400 ml-1">
                ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
              </span>
            )}
          </div>

          <span className="text-gray-500 dark:text-gray-400">|</span>

          <span
            className={`font-medium ${
              inStock && defaultVariant.stock > 10
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {inStock
              ? defaultVariant.stock > 10
                ? "In Stock"
                : "Low in Stock"
              : "Out of Stock"}
          </span>
        </div>
      </div>

      {/* Price Display with MRP & Discount */}
      <div className="flex flex-wrap items-center gap-3">
        {defaultVariant?.price ? (
          <>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatPrice(defaultVariant.price)}
            </span>

            {hasDiscount && (
              <>
                <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                  {formatPrice(mrp!)}
                </span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </>
        ) : (
          <span className="text-2xl font-medium text-gray-500 dark:text-gray-400">
            Price not available
          </span>
        )}

        {defaultVariant?.stock <= 10 && defaultVariant?.stock > 0 && (
          <span className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            only {defaultVariant.stock} units available
          </span>
        )}
      </div>

      {/* Specifications Table */}
      <ShowProductSpecification defaultVariant={defaultVariant} />

      {/* 🌟 Seamless Product Highlights (Continuous Stack) */}
      {promotionalImages && promotionalImages.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 border-b pb-2">
            Product Highlights
          </h2>

          <div className="flex flex-col">
            {promotionalImages.map((image: any, index: number) => (
              <div key={index} className="relative w-full">
                <img
                  src={image.url}
                  alt={image.altText || `Highlight ${index + 1}`}
                  className="w-full h-auto object-cover block"
                  loading="lazy"
                />

                {/* Optional caption overlay */}
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 text-white">
                    <p className="text-base font-medium">{image.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
            *Images are for illustration purposes. Actual product may vary.
          </p>
        </section>
      )}
    </div>
  );
});

ProductInfo.displayName = "ProductInfo";

export default ProductInfo;
