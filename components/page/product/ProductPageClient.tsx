// components/page/product/ProductPageClient.tsx
"use client";
import Breadcrumb from "@/components/page/product/Breadcrumb";
import DeliveryInfo from "@/components/page/product/DeliveryInfo";
import ImageZoomViewer from "@/components/page/product/ImageZoomViewer";
import { ProductActionsClient } from "@/components/page/product/ProductActionsClient";
import ProductGallery from "@/components/page/product/ProductGallery";
import ProductInfo from "@/components/page/product/ProductInfo";
import ProductReviews from "@/components/page/product/ProductReviews";
import { IProductVarient, TProduct } from "@/types/product";
import { useSession } from "@/lib/auth-client";
import { useMutation } from "@apollo/client";
import { RECORD_PRODUCT_VIEW } from "@/client/product/product.queries";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FAQSection from "./FAQSection";
import FrequentlyBoughtTogether from "./FrequentlyBoughtTogether";
import RecommendedProducts from "./RecommendedProducts";
import SellerInfo from "./SellerInfo";

interface ProductPageClientProps {
  product: TProduct | null;
}

export default function ProductPageClient({ product }: ProductPageClientProps) {
  const { data: session } = useSession();
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
  const [recordView] = useMutation(RECORD_PRODUCT_VIEW);

  useEffect(() => {
    if (product?.id) {
      // 1. Guest/Local Storage (Always do this for immediate UI feedback or fallback)
      const stored = localStorage.getItem("recentlyViewed");
      let ids: string[] = stored ? JSON.parse(stored) : [];
      ids = ids.filter((id) => id !== product.id);
      ids.unshift(product.id);
      ids = ids.slice(0, 10);
      localStorage.setItem("recentlyViewed", JSON.stringify(ids));

      // 2. Authenticated User (Sync with Backend)
      if (session?.user) {
        recordView({ variables: { productId: product.id } }).catch(console.error);
      }
    }
  }, [product?.id, session?.user]);

  // Force scroll to top on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleAttributeSelect = useCallback(
    (key: string, value: string) => {
      // 1. Construct new potential attributes based on user selection
      const newAttributes = {
        ...selectedAttributes,
        [key]: value,
      };

      // 2. Check if this exact combination exists in any variant
      const exactMatch = (product?.variants as IProductVarient[]).find(
        (variant) => {
          if (!variant.attributes) return false;
          return Object.entries(newAttributes).every(
            ([k, v]) => variant.attributes[k] === v
          );
        }
      );

      if (exactMatch) {
        // Perfect match found, update state normally
        setSelectedAttributes(newAttributes);
      } else {
        // 3. No exact match - "Smart Switch" logic
        // Find ANY variant that has the *newly selected* attribute value.
        // This prevents the "silent fallback to default" issue.
        const bestMatch = (product?.variants as IProductVarient[]).find(
          (variant) => variant.attributes?.[key] === value
        );

        if (bestMatch && bestMatch.attributes) {
          // Switch to this variant's full attributes to ensure a valid state
          const validAttributes: Record<string, string> = {};
          Object.entries(bestMatch.attributes).forEach(([k, v]) => {
            if (typeof v === "string") validAttributes[k] = v;
          });
          setSelectedAttributes(validAttributes);
        } else {
          // Should rarely happen if UI options are valid
          setSelectedAttributes(newAttributes);
        }
      }
    },
    [product?.variants, selectedAttributes]
  );

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
    () => {
      // 1. Prefer Seller Shop Name (if available)
      if (product?.seller?.sellerProfile?.shopName) {
        return product.seller.sellerProfile.shopName;
      }

      // 2. Fallback to Brand Name (if string or object)
      if (typeof product?.brand === "string") return product.brand;
      // @ts-ignore
      if (product?.brand?.name) return product.brand.name;

      // 3. Last resort: Seller Personal Name
      return product?.seller
        ? `${product.seller.firstName || ""} ${product.seller.lastName || ""}`.trim()
        : "Unknown Seller";
    },
    [product?.brand, product?.seller]
  );

  const storeIdentifier = useMemo(() => {
    // Return Slug if available, otherwise User ID
    // Also check if store is valid (active/approved) - though we'll let the link click handle 404 if not
    if (product?.seller?.sellerProfile?.slug) {
      return product.seller.sellerProfile.slug;
    }
    return product?.seller?.id;
  }, [product?.seller]);

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

  // No need for null-check/skeleton here as parent (Server Component) handles it
  if (!product) return null;

  const userId = session?.user?.id;
  const isOwnProduct = !!(userId && product.seller?.id === userId);

  return (
    <>
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
                productId={product.id}
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
              <ProductReviews
                isOwnProduct={isOwnProduct}
                initialReviews={product.reviews as any}
                initialStats={{
                  average: averageRating,
                  total: product.reviews?.length || 0
                }}
              />
              <FAQSection
                productId={product.id}
                isOwnProduct={isOwnProduct}
                initialQuestions={(product as any).questions}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              <DeliveryInfo
                warranty={product.warranty}
                returnPolicy={product.returnPolicy}
                deliveryOptions={product.deliveryOptions}
              />
              <SellerInfo
                sellerName={sellerName}
                sellerId={storeIdentifier}
                isOwnProduct={isOwnProduct}
              />
            </div>
          </div>
        </div>

        {/* Zoom Viewer Overlay - Fixed Position over right column */}
        {imageHoverData.isHovering && (
          <ImageZoomViewer
            imageUrl={imageHoverData.imageUrl}
            position={imageHoverData.position}
            productName={product.name}
            overlayClassName="fixed inset-0 z-50 lg:fixed lg:top-43 lg:left-[45%] lg:ml-8 lg:w-[600px] lg:h-[600px] lg:z-50 lg:rounded-xl lg:shadow-2xl lg:border lg:border-border"
          />
        )}
      </div>

      <FrequentlyBoughtTogether
        currentProduct={product}
      />
      <RecommendedProducts
        currentProductId={product.id}
        title="Similar Products"
      />
      <RecommendedProducts
        currentProductId=""
        title="Recommended for You"
      />

      {/* Sticky Mobile Buy Now Bar - Full width, Amazon/Flipkart style */}
      <div className="lg:hidden sticky-bottom-bar">
        <ProductActionsClient
          productId={product.id}
          productSlug={product.slug}
          variantId={currentVariant?.id || ""}
          inStock={inStock}
          product={product}
        />
      </div>
    </>
  );
}
