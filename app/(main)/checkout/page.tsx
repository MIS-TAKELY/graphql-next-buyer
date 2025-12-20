// pages/checkout.tsx
"use client";

import { AddAddressForm } from "@/components/address";
import { OrderSummary } from "@/components/page/checkout/OrderSummary";
import { PaymentForm } from "@/components/page/checkout/PaymentForm";
import { PaymentMethodSelector } from "@/components/page/checkout/PaymentMethodSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BaseAddress } from "@/types/address";
import { ArrowLeft, CreditCard, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";

// Mock cart data (this would come from your GraphQL query)
const mockOrderItems = [
  {
    id: "1",
    quantity: 2,
    price: 119900,
    variant: {
      id: "variant1",
      price: 119900,
      attributes: { color: "Deep Purple", storage: "256GB" },
      product: {
        name: "iPhone 15 Pro Max",
        images: [{ url: "/api/placeholder/80/80", altText: "iPhone" }],
      },
    },
  },
  {
    id: "2",
    quantity: 1,
    price: 39900,
    variant: {
      id: "variant2",
      price: 39900,
      attributes: { color: "Black", connectivity: "Wireless" },
      product: {
        name: "Sony WH-1000XM5",
        images: [{ url: "/api/placeholder/80/80", altText: "Headphones" }],
      },
    },
  },
];

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState<BaseAddress | null>(
    null
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = mockOrderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 0; // Free shipping
  const tax = 0;
  const total = subtotal + shipping + tax;

  const steps = [
    { id: 1, name: "Shipping", icon: Truck },
    { id: 2, name: "Payment", icon: CreditCard },
    { id: 3, name: "Review", icon: ShieldCheck },
  ];

  const handleAddressSubmit = (address: BaseAddress) => {
    setShippingAddress(address);
    setCurrentStep(2);
  };

  const handlePaymentMethodSelect = (method: any) => {
    setSelectedPaymentMethod(method);
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    console.log("payment data-->", paymentData);
    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setCurrentStep(3);
    setIsProcessing(false);
  };



  return (
    <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 lg:py-8 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/cart">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
            Back to Cart
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Checkout
        </h1>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${isCompleted
                    ? "bg-green-500 dark:bg-green-500 border-green-500 dark:border-green-500 text-white"
                    : isActive
                      ? "border-blue-500 dark:border-blue-400 text-blue-500 dark:text-blue-400"
                      : "border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${isActive
                    ? "text-blue-500 dark:text-blue-400"
                    : isCompleted
                      ? "text-green-500 dark:text-green-400"
                      : "text-gray-400 dark:text-gray-500"
                    }`}
                >
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 ml-4 ${isCompleted
                      ? "bg-green-500 dark:bg-green-400"
                      : "bg-gray-300 dark:bg-gray-600"
                      }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === 1 && (
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Truck className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AddAddressForm
                  onSave={handleAddressSubmit}
                  context="buy-now"
                />
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
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
                      onClick={() => setCurrentStep(1)}
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
                        {shippingAddress.label || "Shipping Address"}
                      </p>
                      <p>{shippingAddress.line1}</p>
                      {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
                      <p>
                        {shippingAddress.city}, {shippingAddress.state}{" "}
                        {shippingAddress.postalCode}
                      </p>
                      <p>{shippingAddress.country}</p>
                      <p className="text-gray-600 dark:text-gray-300">
                        Phone: {shippingAddress.phone}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method Selection */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentMethodSelector
                    onSelect={handlePaymentMethodSelect}
                    selected={selectedPaymentMethod}
                  />
                </CardContent>
              </Card>

              {/* Payment Form */}
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
                      onSubmit={handlePaymentSubmit}
                      isProcessing={isProcessing}
                      amount={total}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
              <CardContent className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400">
                  Order Placed Successfully!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Thank you for your order. You will receive a confirmation
                  email shortly.
                </p>
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <p>Order ID: #ORD-{Date.now()}</p>
                  <p>Estimated delivery: 3-5 business days</p>
                </div>
                <div className="flex gap-4 justify-center mt-8">
                  <Link href="/">
                    <Button
                      variant="outline"
                      className="border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Continue Shopping
                    </Button>
                  </Link>
                  <Button className="bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-400">
                    Track Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <OrderSummary
            items={mockOrderItems}
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            total={total}
            formatPrice={formatPrice}
          />
        </div>
      </div>
    </div>
  );
}
