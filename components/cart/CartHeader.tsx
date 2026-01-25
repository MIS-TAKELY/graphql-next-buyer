import { CartItem } from "@/store/cartStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

const CartHeader = ({
  cartItems,
  selectedCount = 0,
  onSelectAll,
  isAllSelected = false,
}: {
  cartItems: CartItem[];
  selectedCount?: number;
  onSelectAll?: () => void;
  isAllSelected?: boolean;
}) => {
  return (
    <div className="flex flex-col gap-4 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-col gap-2">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 w-fit p-0 h-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Shopping Cart
            </h1>
            <Badge
              variant="secondary"
              className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              {selectedCount} / {cartItems.length}{" "}
              {cartItems.length === 1 ? "item" : "items"} selected
            </Badge>
          </div>
        </div>

        {cartItems.length > 0 && onSelectAll && (
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 px-3 rounded-md border border-gray-200 dark:border-gray-700">
            <Checkbox
              id="select-all"
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Select All
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartHeader;