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
}: BuyNowButtonProps) {
  const router = useRouter();

  const handleBuyNow = useCallback(() => {
    // Call custom onClick handler if provided
    onClick?.();

    if (disabled || !inStock) return;
    
    // Navigate to buy-now page with product and quantity parameters
    const searchParams = new URLSearchParams({
      product: productSlug,
      quantity: quantity.toString()
    });
    
    router.push(`/buy-now?${searchParams.toString()}`);
  }, [disabled, inStock, productSlug, quantity, router, onClick]);

  const isDisabled = disabled || !inStock;

  return (
    <Button
      size={size}
      variant={isDisabled ? "secondary" : variant}
      onClick={handleBuyNow}
      // disabled={isDisabled}
      className={`transition-all duration-200 transform w-full active:scale-95 ${
        fullWidth ? "flex-1" : ""
      } ${
        !isDisabled 
          ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl" 
          : ""
      } ${className}`}
    >
      <span className="flex items-center justify-center gap-2">
        {showIcon && (
          isDisabled ? (
            <ShoppingBag className="w-5 h-5" />
          ) : (
            <Zap className="w-5 h-5" />
          )
        )}
        <span className="transition-all duration-200 font-semibold">
          {children || (isDisabled ? "Notify me" : "Buy Now")}
        </span>
      </span>
    </Button>
  );
}
