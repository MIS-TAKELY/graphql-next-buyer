import { useUIStore } from '@/store/uiStore';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/cart/useCart";
import { ShoppingCart } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
} from "@/components/ui/sheet";
import dynamic from 'next/dynamic';
import { useShallow } from 'zustand/react/shallow';

// Lazy load the heavy sheet content
// This significantly reduces the initial JS bundle size for the navbar
const CartSheetContent = dynamic(() => import('./CartSheetContent'), {
  loading: () => null, // Or a lightweight skeleton if needed, but Sheet usually handles mount
  ssr: false // No need for SSR for a user-interactive drawer
});

interface CartButtonProps {
  isMobile?: boolean;
}

const CartButton = ({ isMobile = false }: CartButtonProps) => {
  const { myCartItems: cartProductIds } = useCart();

  // Use global UI store for cart state with shallow comparison to prevent infinite loops
  const { isCartOpen, openCart, closeCart } = useUIStore(
    useShallow((state) => ({
      isCartOpen: state.isCartOpen,
      openCart: state.openCart,
      closeCart: state.closeCart,
    }))
  );

  // Helper for onOpenChange
  const handleOpenChange = (open: boolean) => {
    if (open) openCart();
    else closeCart();
  };

  // Use cartProductIds size for badge
  const badgeCount = cartProductIds?.size || 0;

  const TriggerButton = () => (
    isMobile ? (
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 h-12 text-foreground hover:bg-secondary relative"
      >
        <ShoppingCart className="w-4 h-4 text-muted-foreground" />
        <span>Cart</span>
        {badgeCount > 0 && (
          <Badge className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">
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
        <span className="hidden lg:inline font-light">Cart</span>
        {badgeCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-4 w-4 lg:h-5 lg:w-5 p-0 flex items-center justify-center text-[10px] lg:text-xs bg-destructive text-destructive-foreground">
            {badgeCount}
          </Badge>
        )}
      </Button>
    )
  );

  return (
    <Sheet open={isCartOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {/* We need a wrapper span because SheetTrigger passes props to child */}
        <span className="cursor-pointer" onClick={() => !isCartOpen && openCart()}>
          <TriggerButton />
        </span>
      </SheetTrigger>
      {/* 
        Ideally, we only render the lazy component when open, or let Sheet handle it.
        Shadcn Sheet usually renders content in a Portal.
        By default, we can just render it here, and dynamic import happens on mount (client-side).
        Or better, only if isCartOpen is true to delay request until interaction?
        Actually, prefetching on hover or just letting it load on idle is fine.
        Standard dynamic import is fine.
      */}
      {isCartOpen && <CartSheetContent />}
    </Sheet>
  );
};

export default CartButton;