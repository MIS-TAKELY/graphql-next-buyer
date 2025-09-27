"use client";
import { ProductActions } from "@/components/common/ProductActions";
import QuantitySelector from "@/components/page/product/QuantitySelector";
import WishlistShareButtons from "@/components/page/product/WishlistShareButtons";
import { useWishlist } from "@/hooks/wishlist/useWishlist";
import { useEffect, useState } from "react";

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
  const { wishlistItems, handleAddToWishlist, handleRemoveFromWishlist } =
    useWishlist();
  const [addedToWishlist, setAddedToWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Check if the product is in the wishlist when the component mounts or wishlistsItems changes
  useEffect(() => {
    const isInWishlist = wishlistItems.some(
      (item: any) => item.product.id === productId
    );
    setAddedToWishlist(isInWishlist);
  }, [wishlistItems, productId]);

  // Toggle wishlist status
  const toggleWishlist = async () => {
    if (addedToWishlist) {
      // Find the wishlist ID for the item (assuming first wishlist for simplicity)
      const wishlistItem = wishlistItems.find(
        (item: any) => item.product.id === productId
      );
      if (wishlistItem) {
        console.log("removing from wishlist");
        await handleRemoveFromWishlist(productId, wishlistItem.wishlistId);
      }
    } else {
      console.log("adding to wishlist");
      await handleAddToWishlist(productId);
    }
    // No need to setAddedToWishlist here; the useEffect will handle it when wishlistsItems updates
  };

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
