// components/page/buy-now/PaymentStep.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { PaymentMethodSelector } from "@/components/page/checkout/PaymentMethodSelector";
import { PaymentForm } from "@/components/page/checkout/PaymentForm";

interface PaymentStepProps {
  selectedAddress: any;
  selectedPaymentMethod: any;
  orderAmount: number;
  isProcessingPayment: boolean;
  onPaymentMethodSelect: (method: any) => void;
  onPaymentSubmit: (paymentData: any) => void;
  onBackToAddress: () => void;
}

export function PaymentStep({
  selectedAddress,
  selectedPaymentMethod,
  orderAmount,
  isProcessingPayment,
  onPaymentMethodSelect,
  onPaymentSubmit,
  onBackToAddress,
}: PaymentStepProps) {
  if (!selectedAddress) return null;

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          Payment Method
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Choose your payment method
        </p>
      </CardHeader>
      <CardContent>
        <PaymentMethodSelector
          onSelect={onPaymentMethodSelect}
          selected={selectedPaymentMethod}
        />
        <PaymentForm
          paymentMethod={
            selectedPaymentMethod || {
              id: "default",
              type: "card",
              name: "Credit Card",
            }
          }
          onSubmit={onPaymentSubmit}
          isProcessing={isProcessingPayment}
          amount={orderAmount}
        />
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={onBackToAddress}
            className="w-full sm:w-auto border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Back to Address
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}