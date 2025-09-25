// components/page/product/ProductPageClient.tsx
"use client";
import Breadcrumb from "@/components/page/product/Breadcrumb";
import DeliveryInfo from "@/components/page/product/DeliveryInfo";
import { ProductActionsClient } from "@/components/page/product/ProductActionsClient";
import ProductGallery from "@/components/page/product/ProductGallery";
import ProductInfo from "@/components/page/product/ProductInfo";
import ProductPageSkeleton from "@/components/page/product/ProductPageSkeleton";
import ProductTabs from "@/components/page/product/ProductTabs";
import { IProductVarient, TProduct } from "@/types/product";
import { useMemo } from "react";
import SellerInfo from "./SellerInfo";

interface ProductPageClientProps {
  product: TProduct | null;
}

export default function ProductPageClient({ product }: ProductPageClientProps) {
  const averageRating = useMemo(
    () =>
      product?.reviews?.length
        ? product.reviews.reduce(
            (sum: number, r: any) => sum + (r.rating || 0),
            0
          ) / product.reviews.length
        : 0,
    [product]
  );

  const defaultVariant = useMemo(() => {
    return (
      (product?.variants as IProductVarient[])?.find(
        (variant) => variant.isDefault
      ) || (product?.variants as IProductVarient[])?.[0]
    );
  }, [product]);

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
    [product]
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
    [product]
  );

  if (!product) {
    return <ProductPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Breadcrumb
        category={product.category?.name || "Unknown Category"}
        name={product.name}
      />
      <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <ProductGallery images={sortedImages} productName={product.name} />
          <div className="space-y-4">
            <ProductInfo
              product={product}
              averageRating={averageRating}
              inStock={inStock}
              defaultVariant={defaultVariant}
            />
            <ProductActionsClient
              productId={product.id || ""}
              productSlug={product.slug}
              variantId={defaultVariant?.id || ""}
              inStock={inStock}
            />
            <DeliveryInfo
              warranty={product.warranty || "No warranty information"}
            />
            <SellerInfo sellerName={sellerName} />
          </div>
        </div>
        <ProductTabs
          product={product}
          averageRating={averageRating}
          mockReviews={product.reviews || []}
        />
      </div>
    </div>
  );
}
