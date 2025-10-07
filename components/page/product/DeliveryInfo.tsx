// components/page/product/DeliveryInfo.tsx
import { Truck, RotateCcw, Shield } from "lucide-react";

interface DeliveryInfoProps {
  warranty: string;
}

export default function DeliveryInfo({ warranty }: DeliveryInfoProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3 my-4">
      <div className="flex items-center gap-3">
        <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
        <span className="text-sm text-gray-900 dark:text-white">Free delivery by tomorrow</span>
      </div>
      <div className="flex items-center gap-3">
        <RotateCcw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <span className="text-sm text-gray-900 dark:text-white">7 days replacement policy</span>
      </div>
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <span className="text-sm text-gray-900 dark:text-white">{warranty || "Warranty information available"}</span>
      </div>
    </div>
  );
}