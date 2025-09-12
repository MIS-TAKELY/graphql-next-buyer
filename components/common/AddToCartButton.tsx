"use client";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/cart/useCart";
import { Check, Loader2, ShoppingCart } from "lucide-react";
import { useState } from "react";

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
  const {
    cartItems,
    cartLoading,
    addToCart,
    removeFromCart,
    pendingOperations,
    itemLoading,
  } = useCart();

  const isInCart = cartItems.has(productId || "");
  const isDisabled = disabled || !variantId || cartLoading;
  const isPendingOperation = pendingOperations.has(productId || "");

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDisabled) return;

    try {
      if (isInCart) {
        await removeFromCart(variantId!, productId!);
        onRemoveSuccess?.();
      } else {
        await addToCart(variantId!, productId!);
        onAddSuccess?.();
      }
    } catch (error) {
      onError?.(error);
    }
  };

  const getButtonText = () => {
    if (cartLoading && cartItems.size === 0) return "Loading...";
    return isInCart ? "In Cart" : "Add To Cart";
  };

  const getButtonIcon = () => {
    if (!showIcon) return null;

    if (itemLoading && isPendingOperation) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }

    if (isInCart) {
      return <Check className="w-4 h-4" />;
    }

    return <ShoppingCart className="w-4 h-4" />;
  };

  const getButtonVariant = () => {
    if (isInCart) return "outline";
    return variant || "default";
  };

  const getButtonStyles = () => {
    let styles = "w-full transition-all duration-75 active:scale-95";

    if (isInCart) {
      styles +=
        " border-gray-400 text-gray-600 hover:bg-red-50 hover:border-red-500 hover:text-red-600";
    } else {
      styles += " bg-white hover:bg-gray-100 text-black";
    }

    return `${styles} ${className}`;
  };

  return (
    <Button
      size={size}
      variant={getButtonVariant()}
      onClick={handleClick}
      disabled={isDisabled || itemLoading}
      className={getButtonStyles()}
    >
      <span className="flex items-center justify-center gap-2 min-w-[100px]">
        {getButtonIcon()}
        <span>{getButtonText()}</span>
      </span>
    </Button>
  );
}