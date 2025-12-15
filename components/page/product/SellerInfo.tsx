// components/page/product/SellerInfo.tsx
import { Button } from "@/components/ui/button";

interface SellerInfoProps {
  sellerName: string;
}

export default function SellerInfo({ sellerName }: SellerInfoProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3 my-4 overflow-hidden h-full flex flex-col justify-center">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-sm text-gray-600 dark:text-gray-300 block mb-1">Sold by</span>
          <p className="font-medium text-blue-600 dark:text-blue-400 truncate text-sm sm:text-base" title={sellerName}>
            {sellerName}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs sm:text-sm text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 shrink-0 h-8 px-3"
        >
          View Store
        </Button>
      </div>
    </div>
  );
}