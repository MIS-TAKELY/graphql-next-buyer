// app/(main)/cart/page.tsx
"use client";

import CartEmpty from "@/components/cart/CartEmpty";
import CartHeader from "@/components/cart/CartHeader";
import CartItem from "@/components/cart/CartItem";
import CartOrderSummary from "@/components/cart/CartOrderSummary";
import { useCart } from "@/hooks/cart/useCart";
import { ShoppingBag, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function CartPage() {
  const router = useRouter();
  const {
    removeFromCart,
    updateQuantity,
    cartItems,
    isLoading,
    selectedItems,
    selectedVariantIds,
    toggleSelection,
    selectAll,
    setSelected,
  } = useCart();

  const [showStockError, setShowStockError] = useState(false);

  const isAllSelected = cartItems.length > 0 && selectedVariantIds.length === cartItems.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelected([]);
    } else {
      selectAll();
    }
  };

  const { subtotal, originalTotal, totalSavings } = useMemo(() => {
    const subtotal = selectedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const originalTotal = selectedItems.reduce((sum, item) => {
      const comparePrice = item.comparePrice || item.price;
      return sum + comparePrice * item.quantity;
    }, 0);
    const totalSavings = originalTotal - subtotal;

    return { subtotal, originalTotal, totalSavings };
  }, [selectedItems]);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to proceed.");
      return;
    }

    const hasOutOfStock = selectedItems.some((item) => (item.stock || 0) <= 0);

    if (hasOutOfStock) {
      setShowStockError(true);
      return;
    }

    router.push("/checkout");
  };

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

  if (cartItems.length === 0 && !isLoading) {
    return <CartEmpty />;
  }

  return (
    <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 lg:py-8 bg-gray-50 dark:bg-gray-900">
      <CartHeader
        cartItems={cartItems}
        selectedCount={selectedItems.length}
        onSelectAll={handleSelectAll}
        isAllSelected={isAllSelected}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <CartItem
              key={`${item.id}-${item.variantId}`}
              item={item}
              updateQuantity={updateQuantity}
              removeItem={removeFromCart}
              selected={selectedVariantIds.includes(item.variantId)}
              onToggle={toggleSelection}
            />
          ))}
        </div>
        <CartOrderSummary
          cartItems={selectedItems}
          subtotal={subtotal}
          originalTotal={originalTotal}
          totalSavings={totalSavings}
          onCheckout={handleCheckout}
          disabled={selectedItems.length === 0}
        />
      </div>

      <AlertDialog open={showStockError} onOpenChange={setShowStockError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertTriangle className="h-5 w-5" />
              <AlertDialogTitle>Out of Stock Items</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Some of the items you&apos;ve selected are currently out of stock.
              Please remove them or deselect them to proceed with your purchase.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowStockError(false)}>
              Okay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
