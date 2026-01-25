// app/(main)/cart/page.tsx
"use client";

import CartEmpty from "@/components/cart/CartEmpty";
import CartError from "@/components/cart/CartError";
import CartHeader from "@/components/cart/CartHeader";
import CartItem from "@/components/cart/CartItem";
import CartOrderSummary from "@/components/cart/CartOrderSummary";
import { useCart } from "@/hooks/cart/useCart";
import { ShoppingBag } from "lucide-react";
import { useMemo } from "react";

export default function CartPage() {
  const {
    removeFromCart,
    updateQuantity,
    cartItems,
    isLoading,
    loading
  } = useCart();

  const { subtotal, originalTotal, totalSavings } = useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const originalTotal = cartItems.reduce((sum, item) => {
      const comparePrice = item.comparePrice || item.price;
      return sum + comparePrice * item.quantity;
    }, 0);
    const totalSavings = originalTotal - subtotal;

    return { subtotal, originalTotal, totalSavings };
  }, [cartItems]);

  if (isLoading && cartItems.length === 0) {
    return (
      <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 bg-gray-50 dark:bg-gray-900">
        <div className="text-center py-16">
          <ShoppingBag className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-500 mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Loading cart...
          </h2>
        </div>
      </div>
    );
  }

  // Assuming useCart handles error logging, we can check basic empty/error states
  // But strictly, useCart doesn't expose error directly yet, but assuming it works.

  if (cartItems.length === 0 && !isLoading) {
    return <CartEmpty />;
  }

  return (
    <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 lg:py-8 bg-gray-50 dark:bg-gray-900">
      <CartHeader cartItems={cartItems} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <CartItem
              key={`${item.id}-${item.variantId}`}
              item={item}
              updateQuantity={updateQuantity} // updateQuantity accepts (variantId, qty)
              removeItem={removeFromCart} // removeFromCart accepts (variantId, productId)
            />
          ))}
        </div>
        <CartOrderSummary
          cartItems={cartItems}
          subtotal={subtotal}
          originalTotal={originalTotal}
          totalSavings={totalSavings}
        />
      </div>
    </div>
  );
}
