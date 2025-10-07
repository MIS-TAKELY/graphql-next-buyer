// components/page/product/ProductPageClient.tsx
"use client";
import Breadcrumb from "@/components/page/product/Breadcrumb";
import DeliveryInfo from "@/components/page/product/DeliveryInfo";
import { ProductActionsClient } from "@/components/page/product/ProductActionsClient";
import ProductGallery from "@/components/page/product/ProductGallery";
import ProductInfo from "@/components/page/product/ProductInfo";
import ProductPageSkeleton from "@/components/page/product/ProductPageSkeleton";
import ProductTabs from "@/components/page/product/ProductTabs";
import ImageZoomViewer from "@/components/page/product/ImageZoomViewer";
import { IProductVarient, TProduct } from "@/types/product";
import { useMemo, useState, useCallback, useRef, useEffect } from "react";
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

  const defaultVariant = useMemo(() => {
    return (
      (product?.variants as IProductVarient[])?.find(
        (variant) => variant.isDefault
      ) || (product?.variants as IProductVarient[])?.[0]
    );
  }, [product?.variants]);

  const inStock = useMemo(
    () => (defaultVariant ? Number(defaultVariant.stock) > 0 : false),
    [defaultVariant]
  );

  const sellerName = useMemo(
    () =>
      product?.brand?.name ||
      (product?.seller
        ? `${product.seller.firstName || ""} ${
            product.seller.lastName || ""
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

  const hasMultipleImages = sortedImages.length > 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      <Breadcrumb
        category={product.category?.name || "Unknown Category"}
        name={product.name}
      />

      <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 lg:py-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8 mb-12">
          {/* LEFT COLUMN - FIXED */}
          <div className="space-y-4 lg:sticky lg:top-24 h-fit self-start">
            <ProductGallery
              images={sortedImages}
              productName={product.name}
              onImageHover={handleImageHover}
            />
            <ProductActionsClient
              productId={product.id || ""}
              productSlug={product.slug}
              variantId={defaultVariant?.id || ""}
              inStock={inStock}
            />
          </div>

          {/* RIGHT COLUMN - SCROLLABLE */}
          <div className="space-y-4">
            {/* Desktop: Always show product info */}
            <div className="hidden lg:block">
              <ProductInfo
                product={product}
                averageRating={averageRating}
                inStock={inStock}
                defaultVariant={defaultVariant}
              />
              <DeliveryInfo
                warranty={product.warranty || "No warranty information"}
              />
              <SellerInfo sellerName={sellerName} />
            </div>

            {/* Mobile: Always show product info */}
            <div className="lg:hidden space-y-4">
              <ProductInfo
                product={product}
                averageRating={averageRating}
                inStock={inStock}
                defaultVariant={defaultVariant}
              />
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
            overlayClassName="fixed top-16 left-[40%] ml-8 w-[730px] h-[655px] hidden lg:block z-50"
          />
        )}
      </div>
    </div>
  );
}