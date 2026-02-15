// components/page/product/ProductInfo.tsx
"use client";

import { TProduct } from "@/types/product";
import { Star } from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import ShowProductSpecification from "./ShowProductSpecification";
import { formatPrice } from "@/lib/utils";
import VariantSelector from "./VariantSelector";
import SmartMedia from "@/components/ui/SmartMedia";

interface ProductInfoProps {
  product: TProduct;
  averageRating: number;
  inStock: boolean;
  defaultVariant: any;
  variants: any[];
  selectedAttributes: Record<string, string>;
  onAttributeSelect: (key: string, value: string) => void;
}

const ProductInfo = memo(function ProductInfo({
  product,
  averageRating,
  inStock,
  defaultVariant,
  variants,
  selectedAttributes,
  onAttributeSelect,
}: ProductInfoProps) {


  const [showAllHighlights, setShowAllHighlights] = useState(false);
  const highlightsRef = useRef<HTMLElement>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const reviewCount = product.reviews?.length || 0;

  const promotionalImages = useMemo(
    () =>
      product?.images?.filter((image) => image.mediaType === "PROMOTIONAL") || [],
    [product?.images]
  );

  const mrp = defaultVariant?.mrp;
  const price = parseFloat(defaultVariant?.price || "0");
  const hasDiscount = mrp && mrp > price;
  const discountPercent = hasDiscount
    ? Math.round(((mrp - price) / mrp) * 100)
    : 0;

  const scrollToHighlights = () => {
    if (typeof window === "undefined") return;
    setShowAllHighlights(false);
    // Use a small timeout to allow the DOM to update before scrolling
    setTimeout(() => {
      if (highlightsRef.current) {
        const topOffset = highlightsRef.current.getBoundingClientRect().top + window.pageYOffset - 100;
        window.scrollTo({ top: topOffset, behavior: "smooth" });
      }
    }, 10);
  };

  return (
    <div className="space-y-6">
      {/* Product Title & Status */}
      <div>
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            {product.name}
          </h1>
        </div>

        {/* Category & Brand */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {product.category?.name && (
            <span className="capitalize hover:text-primary transition-colors cursor-pointer">{product.category.name}</span>
          )}
          {product.brand?.name && (
            <>
              <span className="text-border">•</span>
              <span className="hover:text-primary transition-colors cursor-pointer">{product.brand.name}</span>
            </>
          )}
        </div>

        {product.description && (
          <div className="mt-4">
            <p className={`text-muted-foreground text-base whitespace-pre-wrap leading-relaxed ${!isDescExpanded ? 'line-clamp-3' : ''} transition-all duration-300`}>
              {product.description}
            </p>
            {product.description.length > 150 && (
              <button
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="text-blue-600 dark:text-blue-400 text-sm font-semibold mt-1 hover:underline focus:outline-none"
              >
                {isDescExpanded ? 'See less' : 'See more'}
              </button>
            )}
          </div>
        )}

        {/* SKU and Additional Info */}
        {defaultVariant?.sku && (
          <div className="mt-3 text-sm text-muted-foreground">
            <span className="font-medium">SKU:</span> {defaultVariant.sku}
          </div>
        )}

        {/* Rating & Stock Status */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5 p-1.5 bg-secondary/30">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 fill-current ${i < Math.floor(averageRating)
                    ? "text-yellow-400"
                    : "text-muted-foreground/30"
                    }`}
                />
              ))}
            </div>
            {averageRating > 0 ? (
              <span className="flex items-center gap-1.5 bg-green-600 text-white px-2 py-0.5 rounded text-sm font-bold">
                {averageRating.toFixed(1)}
                <Star className="w-3 h-3 fill-current" />
              </span>
            ) : (
              <span className="text-sm text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded font-medium">
                New Product
              </span>
            )}
            {reviewCount > 0 && (
              <span className="text-xs text-muted-foreground ml-1">
                ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Price Display with MRP & Discount */}
      <div className="flex flex-wrap items-baseline gap-3 p-4 bg-card border border-border/40 shadow-sm w-fit min-w-[200px]">
        {defaultVariant?.price ? (
          <>
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(defaultVariant.price)}
            </span>

            {hasDiscount && (
              <div className="flex flex-col items-start leading-none gap-1">
                <span className="text-sm text-muted-foreground line-through decoration-destructive/50">
                  {formatPrice(mrp!)}
                </span>
                <span className="text-xs font-bold text-success">
                  {discountPercent}% OFF
                </span>
              </div>
            )}
          </>
        ) : (
          <span className="text-xl font-medium text-muted-foreground">
            Price not available
          </span>
        )}
      </div>

      {/* Variant Selector */}
      <VariantSelector
        variants={variants}
        selectedAttributes={selectedAttributes}
        onAttributeSelect={onAttributeSelect}
      />

      {/* Specifications Table */}
      <ShowProductSpecification
        defaultVariant={defaultVariant}
        productSpecificationTable={product.specificationTable}
        specificationDisplayFormat={product.specificationDisplayFormat}
      />

      {/* 🌟 Seamless Product Highlights (Continuous Stack) */}
      {
        promotionalImages && promotionalImages.length > 0 && (
          <section ref={highlightsRef} className="mt-12 pt-6 border-t border-border">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Product Highlights
            </h2>

            {!showAllHighlights ? (
              <div
                className="relative w-full overflow-hidden border border-border/50 aspect-video lg:h-[600px] bg-black/5"
              >
                <SmartMedia
                  src={promotionalImages[0].url}
                  alt={promotionalImages[0].altText || "Highlight 1"}
                  fill
                  className="object-contain"
                  priority
                />

                {/* Show More overlay */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center bg-gradient-to-t from-background via-background/60 to-transparent p-6">
                  <button
                    onClick={() => setShowAllHighlights(true)}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    Show all highlights
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {promotionalImages.map((image: any, index: number) => (
                  <div key={index} className="relative w-full overflow-hidden aspect-video lg:min-h-[500px] bg-black/5 border border-border/40">
                    <SmartMedia
                      src={image.url}
                      alt={image.altText || `Highlight ${index + 1}`}
                      className="w-full h-full block object-contain"
                      fill
                      sizes="100vw"
                    />

                    {/* Optional caption overlay */}
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3 text-white z-10">
                        <p className="text-base font-medium">{image.caption}</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Show Less button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={scrollToHighlights}
                    className="text-muted-foreground hover:text-foreground text-sm font-medium underline transition-colors"
                  >
                    Show less
                  </button>
                </div>
              </div>
            )}
          </section>
        )
      }
    </div >
  );
});

ProductInfo.displayName = "ProductInfo";

export default ProductInfo;
