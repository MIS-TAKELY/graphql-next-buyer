import { ICartItem } from "@/app/(main)/cart/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const CartHeader = ({ cartItems }: { cartItems: ICartItem[] }) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Link href="/">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2 text-gray-900 dark:text-white" />
          Continue Shopping
        </Button>
      </Link>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
      <Badge 
        variant="secondary" 
        className="ml-auto bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
      >
        {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
      </Badge>
    </div>
  );
};

export default CartHeader;