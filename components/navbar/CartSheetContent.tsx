import { GET_MY_CART_ITEMS } from "@/client/cart/cart.queries";
import { GET_PRODUCTS } from "@/client/product/product.queries";
import { Button } from "@/components/ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/hooks/cart/useCart";
import { formatPrice } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { useQuery } from "@apollo/client";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useMemo, useState } from "react";
import QuantitySelector from "../page/product/QuantitySelector";

interface CartItemData {
  id: string;
  name: string;
  image: string;
  price: string;
  variantId: string;
  quantity: number;
}

export default function CartSheetContent() {
  const router = useRouter();
  const {
    myCartItems: cartProductIds,
    removeFromCart,
    updateQuantity,
  } = useCart();
  const { closeCart } = useUIStore();
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [quantity, setQuantity] = useState(1);

  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { anonymousCart } = useCart(); // Get anonymous cart from hook

  // Fetch items for logged-in user
  const { data: cartData, loading: cartLoading } = useQuery(GET_MY_CART_ITEMS, {
    skip: !userId || !cartProductIds || cartProductIds.size === 0,
    fetchPolicy: "cache-first",
  });

  // Fetch items for guest user (if using anonymous cart)
  const { data: allProductsData, loading: allProductsLoading } = useQuery(GET_PRODUCTS, {
    skip: !!userId || !anonymousCart || anonymousCart.length === 0,
    fetchPolicy: "cache-first",
  });

  const cartItems = useMemo((): CartItemData[] => {
    if (userId) {
      if (!cartData?.getMyCart) return [];

      return cartData.getMyCart.map((item: any) => ({
        id: item.variant.product.id,
        name: item.variant.product.name,
        image: item.variant.product.images?.[0]?.url || "/placeholder.svg",
        price: item.variant.price.toString(),
        variantId: item.variant.id,
        quantity: item.quantity,
      }));
    } else {
      // Guest User logic (similar to CartPage)
      if (!anonymousCart || !allProductsData?.getProducts) return [];

      return anonymousCart.map((cartItem) => {
        const product = allProductsData.getProducts.find((p: any) => p.id === cartItem.variant.product.id);
        if (!product) return null;

        const variant = product.variants?.find((v: any) => v.id === cartItem.variant.id) || product.variants?.[0];
        if (!variant) return null;

        return {
          id: product.id,
          name: product.name,
          image: product.images?.[0]?.url || "/placeholder.svg",
          price: variant.price || "0",
          variantId: variant.id,
          quantity: cartItem.quantity || 1,
        };
      }).filter((item): item is CartItemData => item !== null);
    }
  }, [cartData, userId, anonymousCart, allProductsData]);

  const loading = cartLoading || allProductsLoading;

  const displayedItemsCount = cartItems.length;

  const total = useMemo(() => {
    return cartItems.reduce((sum: number, item: CartItemData) => {
      return sum + parseFloat(item.price || "0") * item.quantity;
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

  const handleQuantityChange = async (
    variantId: string,
    productId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;
    setUpdatingItems((prev) => new Set(prev).add(productId));
    try {
      await updateQuantity(variantId, newQuantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      setUpdatingItems((prev) => {
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
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
            <ShoppingCart className="h-12 w-12 opacity-20" />
            <p>Your cart is empty</p>
            <Button variant="outline" onClick={() => closeCart()}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item: CartItemData) => {
              const isRemoving = removingItems.has(item.id);
              const isUpdating = updatingItems.has(item.id);

              return (
                <div
                  key={item.id}
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
                      quality={85}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium line-clamp-2">
                      {item.name}
                    </h4>

                    {/* Quantity controls */}
                    {/* <div className="flex items-center gap-2 mt-2">

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          handleQuantityChange(
                            item.variantId,
                            item.id,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1 || isUpdating}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          handleQuantityChange(
                            item.variantId,
                            item.id,
                            item.quantity + 1
                          )
                        }
                        disabled={isUpdating}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div> */}

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
            <span>{formatPrice(total.toString())}</span>
          </div>
          <Button className="w-full text-lg h-12" onClick={handleCheckout}>
            Proceed to Checkout
          </Button>
        </div>
      )}
    </SheetContent>
  );
}
