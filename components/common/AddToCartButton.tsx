// components/common/AddToCartButton.tsx
"use client";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/cart/useCart";
import { Check, Loader2, ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  productId?: string;
  variantId?: string;
  quantity?: number;
  inStock?: boolean;
  stock?: number;
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
  productName?: string;
  productImage?: string;
  price?: number;
  slug?: string;
  paymentMethods?: string[];
}

export function AddToCartButton({
  productId,
  variantId,
  quantity = 1,
  inStock,
  stock,
  className = "",
  size = "sm",
  variant,
  showIcon = true,
  fullWidth = true,
  disabled = false,
  onAddSuccess,
  onRemoveSuccess,
  onError,
  productName,
  productImage,
  price,
  slug,
  paymentMethods,
}: AddToCartButtonProps) {
  const { checkIsInCart, addToCart, removeFromCart, cartLoading, loading } =
    useCart();

  const isInCart = checkIsInCart(productId);
  const isDisabled = disabled || !variantId;

  const isLoading = cartLoading || loading;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDisabled || isLoading) return;

    try {
      if (isInCart) {
        await removeFromCart(variantId!, productId!);
        onRemoveSuccess?.();
      } else {
        await addToCart(variantId!, productId!, quantity, {
          name: productName || "Product",
          image: productImage || "/placeholder.svg",
          price: price || 0,
          slug,
          stock,
          paymentMethods,
        });
        onAddSuccess?.();
      }
    } catch (error) {
      onError?.(error);
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Loading..";

    return isInCart ? "In Cart" : "Add To Cart";
  };

  const getButtonIcon = () => {
    if (!showIcon) return null;
    if (isLoading) return <Loader2 className="w-4 h-4 animate-spin" />;

    if (isInCart) {
      return <Check className="w-4 h-4" />;
    }

    return <ShoppingCart className="w-4 h-4" />;
  };

  return (
    <Button
      size={size}
      onClick={handleClick}
      disabled={isDisabled || isLoading}
      className={`w-full transition-all duration-75 active:scale-[0.98] min-h-[48px] py-3 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white text-base sm:text-lg font-medium ${className}`}
    >
      <span className="flex items-center justify-center gap-2 min-w-[100px]">
        {getButtonIcon()}
        <span>{getButtonText()}</span>
      </span>
    </Button>
  );
}
