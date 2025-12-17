"use client";
import { ProductActions } from "@/components/common/ProductActions";
import WishlistShareButtons from "@/components/page/product/ProductActions";
import QuantitySelector from "@/components/page/product/QuantitySelector";
import { useWishlist } from "@/hooks/wishlist/useWishlist";
import { TProduct } from "@/types/product";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRealChat } from "@/hooks/chat/useRealChat";
import { ChatModal } from "@/components/page/chat/ChatModal";

interface ProductActionsClientProps {
  productId: string;
  productSlug: string;
  variantId: string;
  inStock: boolean;
  product?: Partial<TProduct>;
}

export function ProductActionsClient({
  productId,
  productSlug,
  variantId,
  inStock,
  product,
}: ProductActionsClientProps) {
  const { isInWishlist, handleAddToWishlist, handleRemoveFromWishlist } =
    useWishlist();
  const { userId } = useAuth();
  const router = useRouter();
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
      router.push("/sign-in");
      return;
    }
    setIsChatOpen(true);
    initializeChat();
  };

  const isAdded = isInWishlist(productId);

  // Toggle wishlist status
  const toggleWishlist = async () => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    if (isAdded) {
      await handleRemoveFromWishlist(productId);
    } else {
      // @ts-ignore - mismatch between TProduct and Wishlist Product types but structurally compatible enough for optimistic UI
      await handleAddToWishlist(productId, product);
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
      />
      <div className="flex w-full gap-2 sm:gap-4">
        <div className="flex-1 flex justify-center items-center">
          <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
        </div>
        <div className="flex flex-1 justify-center items-center">
          <WishlistShareButtons
            addedToWishlist={isAdded}
            toggleWishlist={toggleWishlist}
            itemId={productId}
            onChatOpen={handleChatOpen}
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

