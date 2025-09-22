import { ICartItem } from "@/app/(main)/cart/page";
import { Card, CardContent } from "@/components/ui/card";
import { Tag } from "lucide-react";

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
  const formatPrice = (priceInCents: number) =>
    `$${(priceInCents / 100).toFixed(2)}`;
  return (
    <Card className="sticky top-24 h-fit">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Subtotal ({cartItems.length} items)</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {totalSavings > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                Total Savings
              </span>
              <span>-{formatPrice(totalSavings)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="text-green-600">FREE</span>
          </div>
          <div className="border-t pt-3 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Free shipping on all orders</p>
          <p>30-day return policy</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartOrderSummary;
