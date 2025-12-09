// components/page/product/ProductPageClient.tsx
"use client";
import Breadcrumb from "@/components/page/product/Breadcrumb";
import DeliveryInfo from "@/components/page/product/DeliveryInfo";
import ImageZoomViewer from "@/components/page/product/ImageZoomViewer";
import { ProductActionsClient } from "@/components/page/product/ProductActionsClient";
import ProductGallery from "@/components/page/product/ProductGallery";
import ProductInfo from "@/components/page/product/ProductInfo";
import ProductPageSkeleton from "@/components/page/product/ProductPageSkeleton";
import ProductTabs from "@/components/page/product/ProductTabs";
import { IProductVarient, TProduct } from "@/types/product";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SellerInfo from "./SellerInfo";

interface ProductPageClientProps {
  product: TProduct | null;
}

export default function ProductPageClient({ product }: ProductPageClientProps) {
  const [imageHoverData, setImageHoverData] = useState<{
    isHovering: boolean;
    imageUrl: string;
    position: { x: number; y: number };
  }>({
    isHovering: false,
    imageUrl: "",
    position: { x: 50, y: 50 },
  });

  // Initialize selectedAttributes based on the default variant or first variant
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product?.variants?.length) {
      const defaultVar = (product.variants as IProductVarient[]).find((v) => v.isDefault) || product.variants[0];
      if (defaultVar && defaultVar.attributes) {
        // Ensure attributes are strings
        const initialAttrs: Record<string, string> = {};
        Object.entries(defaultVar.attributes).forEach(([key, value]) => {
          if (typeof value === 'string') initialAttrs[key] = value;
        });
        setSelectedAttributes(initialAttrs);
      }
    }
  }, [product]);

  const handleAttributeSelect = useCallback((key: string, value: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleImageHover = useCallback(
    (data: {
      isHovering: boolean;
      imageUrl: string;
      position: { x: number; y: number };
    }) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (data.isHovering) {
        setImageHoverData(data);
      } else {
        timeoutRef.current = setTimeout(() => {
          setImageHoverData(data);
          timeoutRef.current = null;
        }, 150);
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const averageRating = useMemo(
    () =>
      product?.reviews?.length
        ? product.reviews.reduce(
          (sum: number, r: any) => sum + (r.rating || 0),
          0
        ) / product.reviews.length
        : 0,
    [product?.reviews]
  );

  const currentVariant = useMemo(() => {
    if (!product?.variants?.length) return null;

    // exact match
    const exactMatch = (product.variants as IProductVarient[]).find((variant) => {
      if (!variant.attributes) return false;
      return Object.entries(selectedAttributes).every(([key, value]) => variant.attributes[key] === value);
    });

    if (exactMatch) return exactMatch;

    // TODO: better fallback logic? For now, fallback to default if no match.
    // Or maybe just find the first one that matches *some* attributes?

    // Fallback to default variant
    return (
      (product?.variants as IProductVarient[])?.find(
        (variant) => variant.isDefault
      ) || (product?.variants as IProductVarient[])?.[0]
    );
  }, [product?.variants, selectedAttributes]);

  const inStock = useMemo(
    () => (currentVariant ? Number(currentVariant.stock) > 0 : false),
    [currentVariant]
  );

  const sellerName = useMemo(
    () =>
      product?.brand?.name ||
      (product?.seller
        ? `${product.seller.firstName || ""} ${product.seller.lastName || ""
          }`.trim()
        : "Unknown Seller"),
    [product?.brand?.name, product?.seller]
  );

  const sortedImages = useMemo(
    () =>
      Array.isArray(product?.images)
        ? [...product.images].sort(
          (a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
        )
        : product?.images
          ? [product.images]
          : [],
    [product?.images]
  );

  if (!product) {
    return <ProductPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background relative">
      <Breadcrumb
        category={product.category?.name || "Unknown Category"}
        name={product.name}
      />

      <div className="container-custom py-4 sm:py-6 lg:py-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-8 xl:gap-12 mb-12">
          {/* LEFT COLUMN - FIXED */}
          <div className="space-y-6 lg:sticky lg:top-24 h-fit self-start">
            <ProductGallery
              images={sortedImages}
              productName={product.name}
              onImageHover={handleImageHover}
            />
            <ProductActionsClient
              productId={product.id || ""}
              productSlug={product.slug}
              variantId={currentVariant?.id || ""}
              inStock={inStock}
            />
          </div>

          {/* RIGHT COLUMN - SCROLLABLE */}
          <div className="space-y-6">
            <ProductInfo
              product={product}
              averageRating={averageRating}
              inStock={inStock}
              defaultVariant={currentVariant}
              variants={product.variants || []}
              selectedAttributes={selectedAttributes}
              onAttributeSelect={handleAttributeSelect}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              <DeliveryInfo
                warranty={product.warranty || "No warranty information"}
              />
              <SellerInfo sellerName={sellerName} />
            </div>
          </div>
        </div>

        <ProductTabs
          product={product}
          averageRating={averageRating}
          mockReviews={product.reviews || []}
        />

        {/* Zoom Viewer Overlay - Fixed Position over right column */}
        {imageHoverData.isHovering && (
          <ImageZoomViewer
            imageUrl={imageHoverData.imageUrl}
            position={imageHoverData.position}
            productName={product.name}
            overlayClassName="fixed inset-0 z-50 lg:fixed lg:top-16 lg:left-[45%] lg:ml-8 lg:w-[600px] lg:h-[600px] lg:z-50 lg:rounded-xl lg:shadow-2xl lg:border lg:border-border"
          />
        )}
      </div>
    </div>
  );
}
