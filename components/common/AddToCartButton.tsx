"use client";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/cart/useCart";
import { Check, Loader2, ShoppingCart } from "lucide-react";
import { useState, useTransition } from "react";

type CartStatus = "idle" | "adding" | "removing" | "error";

interface AddToCartButtonProps {
  productId?: string;
  variantId?: string;
  quantity?: number;
  inStock?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  showIcon?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  onAddSuccess?: () => void;
  onRemoveSuccess?: () => void;
  onError?: (error: any) => void;
}

export function AddToCartButton({
  productId,
  variantId,
  quantity = 1,
  inStock,
  className = "",
  size = "sm",
  variant,
  showIcon = true,
  fullWidth = true,
  disabled = false,
  onAddSuccess,
  onRemoveSuccess,
  onError,
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState<CartStatus>("idle");

  const {
    cartItems,
    cartLoading,
    adding,
    removing,
    addToCart,
    removeFromCart,
    pendingOperations,
  } = useCart();

  const isInCart = cartItems.has(productId || "");
  const isDisabled = disabled || !variantId || cartLoading;
  const isPendingOperation = pendingOperations.has(productId || "");

  // Ultra-fast click handler - updates instantly
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDisabled) return;

    // Start transition for even smoother UI updates
    startTransition(async () => {
      try {
        if (isInCart) {
          setLocalStatus("removing");
          // This returns immediately - no waiting!
          await removeFromCart(variantId!, productId!);
          onRemoveSuccess?.();
        } else {
          setLocalStatus("adding");
          // This returns immediately - no waiting!
          await addToCart(variantId!, productId!);
          onAddSuccess?.();
        }
        setLocalStatus("idle");
      } catch (error) {
        setLocalStatus("error");
        onError?.(error);
        // Reset error status after a delay
        setTimeout(() => setLocalStatus("idle"), 2000);
      }
    });
  };

  const getButtonText = () => {
    // Show immediate feedback
    if (localStatus === "adding") return "Adding...";
    if (localStatus === "removing") return "Removing...";
    if (localStatus === "error") return "Try Again";
    if (cartLoading && cartItems.size === 0) return "Loading...";

    return isInCart ? "In Cart" : "Add To Cart";
  };

  const getButtonIcon = () => {
    if (!showIcon) return null;

    // Show spinner for pending operations
    if (
      isPendingOperation &&
      (localStatus === "adding" || localStatus === "removing")
    ) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }

    // Show check icon if item is in cart
    if (isInCart && localStatus !== "removing") {
      return <Check className="w-4 h-4" />;
    }

    return <ShoppingCart className="w-4 h-4" />;
  };

  const getButtonVariant = () => {
    if (localStatus === "error") return "destructive";
    if (isInCart) return "outline";
    return variant || "default";
  };

  const getButtonStyles = () => {
    let styles = "w-full transition-all duration-75 active:scale-95";

    if (isInCart && localStatus !== "error") {
      styles +=
        " border-gray-400 text-gray-600 hover:bg-red-50 hover:border-red-500 hover:text-red-600";
    } else if (localStatus !== "error") {
      styles += " bg-white hover:bg-gray-100 text-black";
    }

    if (isPending) {
      styles += " opacity-95";
    }

    return `${styles} ${className}`;
  };

  return (
    <Button
      size={size}
      variant={getButtonVariant()}
      onClick={handleClick}
      disabled={isDisabled}
      className={getButtonStyles()}
    >
      <span className="flex items-center justify-center gap-2 min-w-[100px]">
        {getButtonIcon()}
        <span>{getButtonText()}</span>
      </span>
    </Button>
  );
}
