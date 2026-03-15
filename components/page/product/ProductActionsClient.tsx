"use client";
import { ProductActions } from "@/components/common/ProductActions";
import WishlistShareButtons from "@/components/page/product/ProductActions";
import QuantitySelector from "@/components/page/product/QuantitySelector";
import { useWishlist } from "@/hooks/wishlist/useWishlist";
import { TProduct } from "@/types/product";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRealChat } from "@/hooks/chat/useRealChat";
import { ChatModal } from "@/components/page/chat/ChatModal";
import { useCompareStore } from "@/store/compareStore";
import { toast } from "sonner";
import { useAuthModal } from "@/store/authModalStore";
import { getDefaultProductImage } from "@/lib/productUtils";

interface ProductActionsClientProps {
  productId: string;
  productSlug: string;
  variantId: string;
  inStock: boolean;
  stock?: number;
  product?: Partial<TProduct>;
  paymentMethods?: string[];
}

export function ProductActionsClient({
  productId,
  productSlug,
  variantId,
  inStock,
  stock,
  product,
  paymentMethods,
}: ProductActionsClientProps) {
  const { isInWishlist, handleAddToWishlist, handleRemoveFromWishlist } =
    useWishlist();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();
  const { openModal } = useAuthModal();
  const [quantity, setQuantity] = useState(1);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const {
    conversationId,
    messages,
    initializeChat,
    handleSend,
    isLoading,
    error,
  } = useRealChat(productId, undefined);

  const handleChatOpen = () => {
    if (!userId) {
      openModal();
      return;
    }
    setIsChatOpen(true);
    initializeChat();
  };

  const isAdded = isInWishlist(productId);

  // Toggle wishlist status
  const toggleWishlist = async () => {
    if (!userId) {
      openModal();
      return;
    }

    if (isAdded) {
      await handleRemoveFromWishlist(productId);
    } else {
      // @ts-ignore - mismatch between TProduct and Wishlist Product types but structurally compatible enough for optimistic UI
      await handleAddToWishlist(productId, product);
    }
  };

  // Compare Logic
  const { addProduct, removeProduct, isSelected } = useCompareStore();
  const isCompared = isSelected(productId);

  const handleCompareToggle = () => {
    if (isCompared) {
      removeProduct(productId);
      toast.success("Removed from comparison");
    } else {
      // Create a compatible product object for the store
      const productForCompare = {
        id: productId,
        slug: productSlug,
        name: product?.name || "",
        images: product?.images || [],
        brand: product?.brand,
        reviews: product?.reviews || [],
        variants: product?.variants || [],
        category: product?.category,
        ...product
      };

      const added = addProduct(productForCompare as any);
      if (added) {
        toast.success("Added to comparison");
      } else {
        toast.error("Maximum 4 products can be compared");
      }
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 bg-gray-50 dark:bg-gray-800 p-3 sm:p-4">
      <ProductActions
        productId={productId}
        productSlug={productSlug}
        variantId={variantId}
        quantity={quantity}
        inStock={inStock}
        stock={stock}
        productName={product?.name}
        productImage={getDefaultProductImage(product?.images)}
        productPrice={product?.variants?.[0]?.price ? parseFloat(product.variants[0].price.toString()) : 0}
        paymentMethods={paymentMethods}
      />
      <div className="flex w-full gap-2 sm:gap-4 justify-between">
        <div className="flex-none flex justify-center items-center">
          <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
        </div>
        <div className="flex flex-1 justify-end sm:justify-center items-center">
          <WishlistShareButtons
            addedToWishlist={isAdded}
            toggleWishlist={toggleWishlist}
            itemId={productId}
            onChatOpen={handleChatOpen}
            isCompared={isCompared}
            onCompareToggle={handleCompareToggle}
          />
        </div>
      </div>

      <ChatModal
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        itemName={product?.name}
        messages={messages}
        isLoading={isLoading}
        error={error}
        onSend={handleSend}
        hasActiveConversation={!!conversationId}
      />
    </div>
  );
}

