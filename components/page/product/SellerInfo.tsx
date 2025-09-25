// components/page/product/SellerInfo.tsx
import { Button } from "@/components/ui/button";

interface SellerInfoProps {
  sellerName: string;
}

export default function SellerInfo({ sellerName }: SellerInfoProps) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-600 dark:text-gray-300">Sold by</span>
          <p className="font-medium text-blue-600 dark:text-blue-400">{sellerName}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          View Store
        </Button>
      </div>
    </div>
  );
}