// components/page/product/ProductPageClient.tsx
"use client";
import DeliveryInfo from "@/components/page/product/DeliveryInfo";
import ImageZoomViewer from "@/components/page/product/ImageZoomViewer";
import { ProductActionsClient } from "@/components/page/product/ProductActionsClient";
import ProductGallery from "@/components/page/product/ProductGallery";
import ProductInfo from "@/components/page/product/ProductInfo";
import ProductPageSkeleton from "@/components/page/product/ProductPageSkeleton";

import ProductReviews from "@/components/page/product/ProductReviews";
import { IProductVarient, TProduct } from "@/types/product";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FAQSection from "./FAQSection";
import RecommendedProducts from "./RecommendedProducts";
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
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (product?.variants?.length) {
      const defaultVar =
        (product.variants as IProductVarient[]).find((v) => v.isDefault) ||
        product.variants[0];
      if (defaultVar && defaultVar.attributes) {
        // Ensure attributes are strings
        const initialAttrs: Record<string, string> = {};
        Object.entries(defaultVar.attributes).forEach(([key, value]) => {
          if (typeof value === "string") initialAttrs[key] = value;
        });
        setSelectedAttributes(initialAttrs);
      }
    }
  }, [product]);

  // Save to Recently Viewed
  useEffect(() => {
    if (product?.id) {
      const stored = localStorage.getItem("recentlyViewed");
      let ids: string[] = stored ? JSON.parse(stored) : [];
      // Remove if exists to push to top
      ids = ids.filter((id) => id !== product.id);
      ids.unshift(product.id);
      // Limit to 10
      ids = ids.slice(0, 10);
      localStorage.setItem("recentlyViewed", JSON.stringify(ids));
    }
  }, [product?.id]);

  // Force scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    const exactMatch = (product.variants as IProductVarient[]).find(
      (variant) => {
        if (!variant.attributes) return false;
        return Object.entries(selectedAttributes).every(
          ([key, value]) => variant.attributes[key] === value
        );
      }
    );

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

  const { userId } = useAuth();
  const isOwnProduct = userId === (product?.seller as any)?.clerkId;

  return (
    <div className="min-h-screen bg-background relative pb-20 lg:pb-0">
      {/* <Breadcrumb
        category={product.category?.name || "Unknown Category"}
        name={product.name}
      /> {/* <Breadcrumb
        category={product.category?.name || "Unknown Category"}
        name={product.name}
      /> */}

      <div className="container-custom py-4 sm:py-6 lg:py-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[4.5fr_5.5fr] gap-8 xl:gap-12 mb-12">
          {/* LEFT COLUMN - FIXED */}
          <div className="space-y-6 lg:sticky lg:top-24 h-fit self-start">
            <ProductGallery
              images={sortedImages}
              productName={product.name}
              onImageHover={handleImageHover}
            />
            {/* Desktop Actions - Hidden on mobile */}
            <div className="hidden lg:block">
              <ProductActionsClient
                productId={product.id || ""}
                productSlug={product.slug}
                variantId={currentVariant?.id || ""}
                inStock={inStock}
                product={product}
              />
            </div>
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
            <div className="space-y-4">
              <ProductReviews isOwnProduct={isOwnProduct} />
              <FAQSection
                productId={product.id || ""}
                isOwnProduct={isOwnProduct}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              <DeliveryInfo
                warranty={product.warranty || ""}
                returnPolicy={product.returnPolicy}
                deliveryOptions={product.deliveryOptions}
              />
              <SellerInfo
                sellerName={sellerName}
                sellerId={product?.seller?.id}
                isOwnProduct={isOwnProduct}
              />
            </div>
          </div>
        </div>


        <RecommendedProducts
          currentProductId={product.id || ""}
          title="Recommended for You"
        />
        <RecommendedProducts
          currentProductId={product.id || ""}
          title="Frequently Bought Together"
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

      {/* Sticky Mobile Buy Now Bar - Full width, Amazon/Flipkart style */}
      <div className="lg:hidden sticky-bottom-bar">
        <ProductActionsClient
          productId={product.id || ""}
          productSlug={product.slug}
          variantId={currentVariant?.id || ""}
          inStock={inStock}
          product={product}
        />
      </div>
    </div>
  );
}
