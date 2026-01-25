import { Button } from "@/components/ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/hooks/cart/useCart";
import { formatPrice } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function CartSheetContent() {
  const router = useRouter();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    loading: cartLoading,
  } = useCart();
  const { closeCart } = useUIStore();
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const displayedItemsCount = cartItems.length;

  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      // Ensure price is treated as number
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      return sum + (price || 0) * item.quantity;
    }, 0);
  }, [cartItems]);

  const handleCheckout = () => {
    closeCart();
    router.push("/cart");
  };

  const handleRemoveItem = async (productId: string, variantId: string) => {
    setRemovingItems((prev) => new Set(prev).add(productId));
    try {
      await removeFromCart(variantId, productId);
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setRemovingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  return (
    <SheetContent className="flex flex-col h-full w-full sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Your Cart ({displayedItemsCount})</SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto py-6">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
            <ShoppingCart className="h-12 w-12 opacity-20" />
            <p>Your cart is empty</p>
            <Link href={"/"}>
              <Button variant="outline" onClick={() => closeCart()}>
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => {
              const isRemoving = removingItems.has(item.id);

              return (
                <div
                  key={`${item.id}-${item.variantId}`}
                  className={`flex gap-4 items-start border-b pb-4 transition-opacity ${isRemoving ? "opacity-50" : ""
                    }`}
                >
                  <div className="h-20 w-20 bg-muted rounded-md overflow-hidden relative flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                      loading="lazy"
                      unoptimized
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium line-clamp-2">
                      {item.name}
                    </h4>

                    <div className="flex items-center justify-between mt-2">
                      <p className="font-semibold">{formatPrice(item.price)}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          handleRemoveItem(item.id, item.variantId)
                        }
                        disabled={isRemoving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="border-t pt-4 space-y-4 mt-auto">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Button className="w-full text-lg h-12" onClick={handleCheckout}>
            Proceed to Checkout
          </Button>
        </div>
      )}
    </SheetContent>
  );
}
