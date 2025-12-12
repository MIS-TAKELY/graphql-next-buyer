"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Zap } from "lucide-react";

interface BuyNowButtonProps {
  productSlug: string;
  quantity?: number;
  inStock: boolean;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  showIcon?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  isFromCart: boolean;
}

export function BuyNowButton({
  productSlug,
  quantity = 1,
  inStock,
  className = "",
  size = "lg",
  variant = "default",
  showIcon = true,
  fullWidth = true,
  disabled = false,
  children,
  onClick,
  isFromCart,
}: BuyNowButtonProps) {
  const router = useRouter();

  const handleBuyNow = useCallback(() => {
    onClick?.();

    if (disabled || !inStock) return;

    if (isFromCart) {
      const searchParams = new URLSearchParams({
        from: "cart",
      });
      router.push(`/buy-now?${searchParams.toString()}`);
    } else {
      const searchParams = new URLSearchParams({
        product: productSlug,
        quantity: quantity.toString(),
      });
      router.push(`/buy-now?${searchParams.toString()}`);
    }
  }, [disabled, inStock, productSlug, quantity, router, onClick, isFromCart]);

  const isDisabled = disabled || !inStock;

  return (
    <Button
      size={size}
      variant={isDisabled ? "secondary" : variant}
      onClick={handleBuyNow}
      className={`transition-all duration-200 transform w-full active:scale-95 ${fullWidth ? "flex-1" : ""
        } ${!isDisabled
          ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl font-bold"
          : ""
        } ${className}`}
    >
      <span className="flex items-center justify-center gap-2">
        {showIcon &&
          (isDisabled ? (
            <ShoppingBag className="w-5 h-5" />
          ) : (
            <Zap className="w-5 h-5" />
          ))}
        <span className="transition-all duration-200 font-semibold">
          {children || (isDisabled ? "Notify me" : "Buy Now")}
        </span>
      </span>
    </Button>
  );
}

