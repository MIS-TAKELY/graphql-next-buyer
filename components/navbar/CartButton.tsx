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

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`relative flex items-center gap-1 lg:gap-2 text-sm lg:text-base text-foreground hover:bg-secondary ${
        isMobile ? "p-2" : ""
      }`}
      onClick={() => router.push("/cart")}
    >
      <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />
      {!isMobile && <span className="hidden lg:inline">Cart</span>}
      {cartCount > 0 && (
        <Badge
          className={`absolute -top-2 ${
            isMobile ? "-right-2" : "-left-2"
          } h-4 w-4 lg:h-5 lg:w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground`}
        >
          {cartCount}
        </Badge>
      )}
    </Button>
  );
};

export default CartButton;
