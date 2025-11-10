import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/cart/useCart";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

interface CartButtonProps {
  isMobile?: boolean;
}

const CartButton = ({ isMobile = false }: CartButtonProps) => {
  const { myCartItems } = useCart();
  const router = useRouter();
  const cartCount = myCartItems?.size || 0;

  if (isMobile) {
    return (
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 h-12 text-foreground hover:bg-secondary relative"
        onClick={() => router.push("/cart")}
      >
        <ShoppingCart className="w-4 h-4 text-muted-foreground" />
        <span>Cart</span>
        {cartCount > 0 && (
          <Badge className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">
            {cartCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="relative flex items-center gap-1 lg:gap-2 text-sm lg:text-base text-foreground hover:bg-secondary"
      onClick={() => router.push("/cart")}
    >
      <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />
      <span className="hidden lg:inline">Cart</span>
      {cartCount > 0 && (
        <Badge className="absolute -top-2 -right-2 h-4 w-4 lg:h-5 lg:w-5 rounded-full p-0 flex items-center justify-center text-[10px] lg:text-xs bg-destructive text-destructive-foreground">
          {cartCount}
        </Badge>
      )}
    </Button>
  );
};

export default CartButton;