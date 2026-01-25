import { CartItem } from "@/store/cartStore";
import { Card, CardContent } from "@/components/ui/card";
import { Tag } from "lucide-react";
import { BuyNowButton } from "../common"; // Adjust path as needed
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const CartOrderSummary = ({
  cartItems,
  subtotal,
  originalTotal,
  totalSavings,
  onCheckout,
  disabled
}: {
  cartItems: CartItem[];
  subtotal: number;
  originalTotal: number;
  totalSavings: number;
  onCheckout?: () => void;
  disabled?: boolean;
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
        <div className="mt-4">
          <Button
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl h-12 text-lg" // Matching style from BuyNowButton
            onClick={onCheckout}
            disabled={disabled}
          >
            Proceed to Checkout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartOrderSummary;
