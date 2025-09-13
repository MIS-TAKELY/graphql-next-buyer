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
    <>
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
    </>
  );
}