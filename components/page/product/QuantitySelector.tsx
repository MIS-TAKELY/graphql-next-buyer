import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuantitySelectorProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
}

export default function QuantitySelector({ quantity, setQuantity }: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="hidden sm:inline font-medium text-sm text-gray-900 dark:text-gray-100">Quantity:</span>
      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-none rounded-l-md"
          disabled={quantity <= 1}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-10 text-center text-sm font-medium text-gray-900 dark:text-white border-x border-gray-200 dark:border-gray-700 py-1.5 h-8 flex items-center justify-center">
          {quantity}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setQuantity(quantity + 1)}
          className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-none rounded-r-md"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
