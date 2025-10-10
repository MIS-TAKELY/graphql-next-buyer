// components/cart/CartOrderSummary.tsx
import { ICartItem } from "@/app/(main)/cart/page";
import { Card, CardContent } from "@/components/ui/card";
import { Tag } from "lucide-react";
import { BuyNowButton } from "../common"; // Adjust path as needed
import { formatPrice } from "../page/checkout/PaymentForm";

const CartOrderSummary = ({
  cartItems,
  subtotal,
  originalTotal,
  totalSavings,
}: {
  cartItems: ICartItem[];
  subtotal: number;
  originalTotal: number;
  totalSavings: number;
}) => {
  return (
    <Card className="sticky top-24 h-fit bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Order Summary
        </h2>
        <div className="space-y-3 text-sm text-gray-900 dark:text-white">
          <div className="flex justify-between">
            <span>Subtotal ({cartItems.length} items)</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {totalSavings > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                Total Savings
              </span>
              <span>-{formatPrice(totalSavings)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300"></div>
        {/* Updated: Navigate to cart buy-now */}
        <BuyNowButton
          productSlug="" // Ignored for cart
          quantity={1} // Ignored for cart
          inStock={true}
          className="mt-4 w-full" // Adjust styling as needed
          isFromCart={true}
        >
          Proceed to Checkout
        </BuyNowButton>
      </CardContent>
    </Card>
  );
};

export default CartOrderSummary;
