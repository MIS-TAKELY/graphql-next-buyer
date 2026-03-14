import { RotateCcw, Shield } from "lucide-react";
import { IWarranty, IReturnPolicy } from "@/types/product";

interface DeliveryInfoProps {
  warranty?: IWarranty[];
  returnPolicy?: IReturnPolicy[];
}

export default function DeliveryInfo({ warranty, returnPolicy }: DeliveryInfoProps) {
  // Determine return policy text
  const currentReturnPolicy = returnPolicy && returnPolicy.length > 0 ? returnPolicy[0] : null;
  const returnText = currentReturnPolicy
    ? currentReturnPolicy.type === 'NO_RETURN'
      ? "No replacement or refund"
      : `${currentReturnPolicy.duration} ${currentReturnPolicy.unit} ${currentReturnPolicy.type.toLowerCase().replace(/_/g, ' ')}`
    : "No replacement or refund";

  // Determine warranty text
  const currentWarranty = warranty && warranty.length > 0 ? warranty[0] : null;
  const warrantyText = currentWarranty && currentWarranty.type !== 'NONE' && currentWarranty.type !== 'NO_WARRANTY'
    ? `${currentWarranty.duration} ${currentWarranty.unit} ${currentWarranty.type.toLowerCase().replace(/_/g, ' ')} warranty`
    : "No warranty";

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3 my-4 overflow-hidden h-full">

      <div className="flex items-start gap-3">
        <RotateCcw className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <span className="text-sm text-gray-900 dark:text-white leading-tight break-words">
          {returnText}
        </span>
      </div>
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
        <span className="text-sm text-gray-900 dark:text-white leading-tight break-words">
          {warrantyText}
        </span>
      </div>
    </div>
  );
}