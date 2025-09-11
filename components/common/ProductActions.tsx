"use client";

import { AddToCartButton } from "./AddToCartButton";
import { BuyNowButton } from "./BuyNowButton";

interface ProductActionsProps {
  productId: string;
  productSlug: string;
  variantId: string;
  quantity?: number;
  inStock: boolean;
  className?: string;
  showBuyNow?: boolean;
  showAddToCart?: boolean;
  onAddSuccess?: () => void;
  onRemoveSuccess?: () => void;
  onError?: (error: any) => void;
  onBuyNowClick?: () => void;
}

export function ProductActions({
  productId,
  productSlug,
  variantId,
  quantity = 1,
  inStock,
  className = "",
  showBuyNow = true,
  showAddToCart = true,
  onAddSuccess,
  onRemoveSuccess,
  onError,
  onBuyNowClick,
}: ProductActionsProps) {
  if (!showBuyNow && !showAddToCart) {
    return null;
  }

  return (
    <div className={`flex gap-4 ${className}`}>
      <div className="w-[50%]">
        {showBuyNow && (
          <BuyNowButton
            productSlug={productSlug}
            quantity={quantity}
            inStock={inStock}
            onClick={onBuyNowClick}
          />
        )}
      </div>

      <div className="w-[50%]">
        {showAddToCart && (
          <AddToCartButton
            productId={productId}
            variantId={variantId}
            quantity={quantity}
            inStock={inStock}
            onAddSuccess={onAddSuccess}
            onRemoveSuccess={onRemoveSuccess}
            onError={onError}
          />
        )}
      </div>
    </div>
  );
}
