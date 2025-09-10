"use client";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/cart/useCart";
import { Check, ShoppingCart } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

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
  const [optimisticCartItems, setOptimisticCartItems] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const {
    cartItems,
    cartLoading,
    adding,
    removing,
    addToCart,
    removeFromCart,
  } = useCart();

  // Sync optimistic state with actual cart state
  useMemo(() => {
    setOptimisticCartItems(new Set<string>(cartItems));
  }, [cartItems]);

  const isInCart = optimisticCartItems.has(productId);
  const isDisabled = disabled || !variantId || cartLoading;

  // Ultra-fast optimistic update
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDisabled) return;

    // Immediate optimistic update using React 18 transitions
    startTransition(() => {
      if (isInCart) {
        setOptimisticCartItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId!);
          return newSet;
        });
      } else {
        setOptimisticCartItems((prev) => {
          const newSet = new Set(prev);
          newSet.add(productId!);
          return newSet;
        });
      }
    });

    try {
      if (isInCart) {
        await removeFromCart(variantId!, productId!);
        onRemoveSuccess?.();
      } else {
        await addToCart(variantId!, productId!);
        onAddSuccess?.();
      }
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticCartItems(new Set(cartItems));
      onError?.(error);
    }
  };

  const getButtonText = () => {
    // Show loading states only for actual network requests
    if (adding && !isPending) return "Adding...";
    if (removing && !isPending) return "Removing...";
    if (cartLoading && cartItems.size === 0) return "Loading...";
    
    return isInCart ? "In Cart" : "Add To Cart";
  };

  const getButtonIcon = () => {
    if (!showIcon) return null;

    // Show check icon if item is in cart
    if (isInCart && !adding && !removing) {
      return <Check className="w-4 h-4" />;
    }

    return <ShoppingCart className="w-4 h-4" />;
  };

  return (
    <Button
      size={size}
      variant={isInCart ? "outline" : variant || "default"}
      onClick={handleClick}
      disabled={isDisabled}
      className={`w-full transition-all duration-100 active:scale-95 ${className} ${
        isInCart
          ? "border-gray-400 text-gray-600 hover:bg-red-50 hover:border-red-500 hover:text-red-600"
          : "bg-white hover:bg-gray-100 text-black"
      } ${isPending ? "opacity-90" : ""}`}
    >
      <span className="flex items-center justify-center gap-2 min-w-[100px]">
        {getButtonIcon()}
        <span>{getButtonText()}</span>
      </span>
    </Button>
  );
}