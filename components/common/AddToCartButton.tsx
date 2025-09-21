import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/cart/useCart";
import { Check, Loader2, ShoppingCart } from "lucide-react";

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
        await addToCart(variantId!, productId!, quantity);
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
      className="w-full transition-all duration-75 active:scale-95 py-5 bg-white hover:bg-gray-100 text-black"
    >
      <span className="flex items-center justify-center gap-2 min-w-[100px]">
        {getButtonIcon()}
        <span>{getButtonText()}</span>
      </span>
    </Button>
  );
}
