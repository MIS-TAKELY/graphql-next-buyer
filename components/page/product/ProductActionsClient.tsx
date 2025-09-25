// components/page/product/ProductActionsClient.tsx
"use client";
import { useState } from "react";
import QuantitySelector from "@/components/page/product/QuantitySelector";
import { ProductActions } from "@/components/common/ProductActions";
import WishlistShareButtons from "@/components/page/product/WishlistShareButtons";

interface ProductActionsClientProps {
  productId: string;
  productSlug: string;
  variantId: string;
  inStock: boolean;
}

export function ProductActionsClient({
  productId,
  productSlug,
  variantId,
  inStock,
}: ProductActionsClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [addedToWishlist, setAddedToWishlist] = useState(false);

  const toggleWishlist = () => setAddedToWishlist(!addedToWishlist);

  return (
    <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
      <ProductActions
        productId={productId}
        productSlug={productSlug}
        variantId={variantId}
        quantity={quantity}
        inStock={inStock}
      />
      <WishlistShareButtons
        addedToWishlist={addedToWishlist}
        toggleWishlist={toggleWishlist}
      />
    </div>
  );
}