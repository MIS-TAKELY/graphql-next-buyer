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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Method
        </CardTitle>
        <p className="text-sm text-muted-foreground">
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
          <Button variant="outline" onClick={onBackToAddress} className="mr-2">
            Back to Address
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}