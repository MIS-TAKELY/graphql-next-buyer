// components/page/buy-now/PaymentStep.tsx
"use client";

import { PaymentForm } from "@/components/page/checkout/PaymentForm";
import { PaymentMethodSelector } from "@/components/page/checkout/PaymentMethodSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Truck } from "lucide-react";

export function PaymentStep({
  shippingAddress,
  selectedPaymentMethod,
  onSelectPayment,
  onSubmit,
  isProcessing,
  total,
  onChangeAddress,
}: any) {
  return (
    <div className="space-y-6">
      {/* Shipping Address Summary */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
            <span className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              Delivery Address
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onChangeAddress}
              className="border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Change
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shippingAddress && (
            <div className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
              <p className="font-medium text-gray-900 dark:text-white">
                {shippingAddress.fullName}
              </p>
              <p>{shippingAddress.streetAddress}</p>
              <p>
                {shippingAddress.city}, {shippingAddress.state}{" "}
                {shippingAddress.zipCode}
              </p>
              <p>{shippingAddress.country}</p>
              <p className="text-gray-600 dark:text-gray-300">
                Phone: {shippingAddress.phoneNumber}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Selection */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentMethodSelector
            onSelect={onSelectPayment}
            selected={selectedPaymentMethod}
          />
        </CardContent>
      </Card>

      {selectedPaymentMethod && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentForm
              paymentMethod={selectedPaymentMethod}
              onSubmit={onSubmit}
              isProcessing={isProcessing}
              amount={total}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
