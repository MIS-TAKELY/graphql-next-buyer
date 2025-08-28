"use client";

import { useCart } from "@/app/(main)/page";
import { ADD_TO_CART, REMOVE_FROM_CART } from "@/client/cart/cart.mutations";
import { GET_CART_PRODUCT_IDS } from "@/client/cart/cart.queries";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@apollo/client";
import { Check, Loader2, ShoppingCart, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

type CartStatus =
  | "idle"
  | "adding"
  | "removing"
  | "added"
  | "removed"
  | "error";

interface AddToCartButtonProps {
  productId: string;
  variantId: string;
  quantity?: number;
  inStock: boolean;
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
  size = "lg",
  variant,
  showIcon = true,
  fullWidth = true,
  disabled = false,
  onAddSuccess,
  onRemoveSuccess,
  onError,
}: AddToCartButtonProps) {
  const [status, setStatus] = useState<CartStatus>("idle");
  const [isHovered, setIsHovered] = useState(false);
  const [optimisticCartItems, setOptimisticCartItems] = useState<Set<string>>(
    new Set()
  );

  // Get cart data
  const { data: cartData, loading: cartLoading } = useQuery(
    GET_CART_PRODUCT_IDS,
    {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
      notifyOnNetworkStatusChange: false,
    }
  );

  const cartProductIds = useMemo(() => {
    if (!cartData?.getMyCart) return new Set<string>();
    return new Set(
      cartData.getMyCart.map((item: any) => item.variant.product.id)
    );
  }, [cartData?.getMyCart]);

  const cartCtx = useCart?.() as
    | { cartItems?: Set<string>; loading?: boolean }
    | undefined;

  const cartItems =
    cartProductIds.size > 0
      ? cartProductIds
      : cartCtx?.cartItems ?? new Set<string>();

  // Update optimistic cart items when real cart data changes
  useMemo(() => {
    setOptimisticCartItems(new Set<string>(cartItems as Set<string>));
  }, [cartItems]);

  // Mutations
  const [addToCart] = useMutation(ADD_TO_CART, {
    refetchQueries: [{ query: GET_CART_PRODUCT_IDS }],
    onCompleted: () => {
      setStatus("added");
      onAddSuccess?.();
      setTimeout(() => setStatus("idle"), 2000);
    },
    onError: (error) => {
      console.error("Add to cart error:", error);
      setStatus("error");
      onError?.(error);
      setOptimisticCartItems(new Set<string>(cartItems as Set<string>));
      setTimeout(() => setStatus("idle"), 2000);
    },
  });

  const [removeFromCart] = useMutation(REMOVE_FROM_CART, {
    refetchQueries: [{ query: GET_CART_PRODUCT_IDS }],
    onCompleted: () => {
      setStatus("removed");
      onRemoveSuccess?.();
      setTimeout(() => setStatus("idle"), 2000);
    },
    onError: (error) => {
      console.error("Remove from cart error:", error);
      setStatus("error");
      onError?.(error);
      setOptimisticCartItems(new Set<string>(cartItems as Set<string>));
      setTimeout(() => setStatus("idle"), 2000);
    },
  });

  // Computed values
  const isInCart = optimisticCartItems.has(productId);
  const isLoading = status === "adding" || status === "removing" || cartLoading;
  const isDisabled = disabled || !variantId || isLoading || !inStock;

  // Handlers
  const handleAdd = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isDisabled) return;

      // Optimistic update
      setOptimisticCartItems((prev) => new Set([...prev, productId]));
      setStatus("adding");

      try {
        await addToCart({
          variables: {
            variantId: variantId,
            quantity: quantity,
          },
        });
      } catch (err) {
        // Error handling is done in onError callback
      }
    },
    [isDisabled, addToCart, variantId, quantity, productId]
  );

  const handleRemove = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isDisabled) return;

      // Optimistic update
      const newSet = new Set(optimisticCartItems);
      newSet.delete(productId);
      setOptimisticCartItems(newSet);
      setStatus("removing");

      try {
        await removeFromCart({
          variables: { variantId: variantId },
        });
      } catch (err) {
        // Error handling is done in onError callback
      }
    },
    [isDisabled, removeFromCart, variantId, productId, optimisticCartItems]
  );

  // Button content based on status
  const getButtonContent = () => {
    switch (status) {
      case "adding":
        return {
          text: "Adding...",
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
        };
      case "removing":
        return {
          text: "Removing...",
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
        };
      case "added":
        return { text: "Added!", icon: <Check className="w-5 h-5" /> };
      case "removed":
        return { text: "Removed!", icon: <Check className="w-5 h-5" /> };
      case "error":
        return { text: "Try again", icon: <X className="w-5 h-5" /> };
      default:
        if (isInCart) {
          return {
            text: isHovered ? "Remove from Cart" : "In Cart",
            icon: <Check className="w-5 h-5" />,
          };
        }
        return {
          text: isDisabled && !inStock ? "Out of Stock" : "Add to Cart",
          icon: <ShoppingCart className="w-5 h-5" />,
        };
    }
  };

  const buttonContent = getButtonContent();

  return (
    <Button
      size={size}
      variant={variant || (isInCart ? "outline" : "default")}
      onClick={isInCart ? handleRemove : handleAdd}
      disabled={isDisabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`transition-all duration-200 transform active:scale-95 ${
        fullWidth ? "flex-1" : ""
      } ${
        isInCart
          ? "border-gray-500 text-gray-600 hover:bg-red-50 hover:border-red-500 hover:text-red-600"
          : ""
      } ${
        status === "added" ? "bg-green-500 hover:bg-green-600 text-white" : ""
      } ${
        status === "removed" ? "bg-gray-500 hover:bg-gray-600 text-white" : ""
      } ${
        status === "error" ? "bg-red-500 hover:bg-red-600 text-white" : ""
      } ${className}`}
    >
      <span className="flex items-center justify-center gap-2">
        {showIcon && buttonContent.icon}
        <span className="transition-all duration-200">
          {buttonContent.text}
        </span>
      </span>
    </Button>
  );
}
