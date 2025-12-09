import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/cart/useCart";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS } from "@/client/product/product.queries";
import { formatPrice } from "@/lib/utils";

interface CartButtonProps {
  isMobile?: boolean;
}

const CartButton = ({ isMobile = false }: CartButtonProps) => {
  const { myCartItems: cartProductIds } = useCart();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch products and filter by cart IDs (same pattern as cart page)
  const { data: productData } = useQuery(GET_PRODUCTS, {
    skip: !isOpen || cartProductIds?.size === 0,
    fetchPolicy: "cache-first",
  });

  // Process cart items (same logic as cart page)
  const cartItems = useMemo(() => {
    if (!productData?.getProducts || !cartProductIds) return [];

    return productData.getProducts
      .filter((product: any) => cartProductIds.has(product.id))
      .map((product: any) => {
        const variant = product.variants?.[0];
        return {
          id: product.id,
          name: product.name,
          image: product.images?.[0]?.url || "/placeholder.svg",
          price: variant?.price || "0",
          variantId: variant?.id,
          quantity: 1,
        };
      });
  }, [productData, cartProductIds]);

  // Use actual filtered items length for accurate count
  const displayedItemsCount = cartItems.length;
  // Use cartProductIds size for badge when drawer is closed (cartItems not yet fetched)
  const badgeCount = cartProductIds?.size || 0;

  const total = useMemo(() => {
    return cartItems.reduce((sum: number, item: any) => {
      return sum + parseFloat(item.price || "0");
    }, 0);
  }, [cartItems]);

  const handleCheckout = () => {
    setIsOpen(false);
    router.push("/cart");
  };

  const TriggerButton = () => (
    isMobile ? (
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 h-12 text-foreground hover:bg-secondary relative"
      >
        <ShoppingCart className="w-4 h-4 text-muted-foreground" />
        <span>Cart</span>
        {badgeCount > 0 && (
          <Badge className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">
            {badgeCount}
          </Badge>
        )}
      </Button>
    ) : (
      <Button
        variant="ghost"
        size="sm"
        className="relative flex items-center gap-1 lg:gap-2 text-sm lg:text-base text-foreground hover:bg-secondary"
      >
        <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />
        <span className="hidden lg:inline">Cart</span>
        {badgeCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-4 w-4 lg:h-5 lg:w-5 rounded-full p-0 flex items-center justify-center text-[10px] lg:text-xs bg-destructive text-destructive-foreground">
            {badgeCount}
          </Badge>
        )}
      </Button>
    )
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {/* We need a wrapper span because SheetTrigger passes props to child */}
        <span><TriggerButton /></span>
      </SheetTrigger>
      <SheetContent className="flex flex-col h-full w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Cart ({displayedItemsCount})</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
              <ShoppingCart className="h-12 w-12 opacity-20" />
              <p>Your cart is empty</p>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Continue Shopping</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item: any) => (
                <div key={item.id} className="flex gap-4 items-start border-b pb-4">
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
                    <h4 className="text-sm font-medium line-clamp-2">{item.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="font-semibold">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                </div>
              ))}
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
    </Sheet>
  );
};

export default CartButton;