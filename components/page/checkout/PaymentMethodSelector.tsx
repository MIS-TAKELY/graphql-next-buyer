"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Banknote, Building2, Check, CreditCard, Wallet } from "lucide-react";

interface PaymentMethod {
  id: string;
  type: string;
  name: string;
  icon: any;
  description: string;
  isPopular?: boolean;
  providers?: string[];
}

interface PaymentMethodSelectorProps {
  onSelect: (method: PaymentMethod) => void;
  selected: PaymentMethod | null;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "credit_card",
    type: "CREDIT_CARD",
    name: "Credit Card",
    icon: CreditCard,
    description: "Visa, MasterCard, American Express",
    providers: ["Visa", "MasterCard", "American Express"],
  },
  {
    id: "debit_card",
    type: "DEBIT_CARD",
    name: "Debit Card",
    icon: CreditCard,
    description: "All major debit cards accepted",
    providers: ["Visa", "MasterCard"],
  },
  {
    id: "net_banking",
    type: "NET_BANKING",
    name: "Net Banking",
    icon: Building2,
    description: "All major banks supported",
    providers: ["Nabil", "NIC", "Prabhu", "Global IME", "Gurkash Finance"],
  },
  {
    id: "wallet",
    type: "WALLET",
    name: "Digital Wallet",
    icon: Wallet,
    description: "Esewa, Khalti, IME Pay",
    providers: ["Esewa", "Khalti", "IME Pay"],
  },
  {
    id: "cod",
    type: "CASH_ON_DELIVERY",
    name: "Cash on Delivery",
    icon: Banknote,
    description: "Pay when your order is delivered",
    providers: [],
  },
];

export function PaymentMethodSelector({
  onSelect,
  selected,
}: PaymentMethodSelectorProps) {
  const handleMethodSelect = (method: PaymentMethod) => {
    onSelect(method);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Choose your preferred payment method
      </div>

      <div className="grid gap-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selected?.id === method.id;

          return (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : "hover:border-gray-400"
              }`}
              onClick={() => handleMethodSelect(method)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          isSelected ? "text-blue-600" : "text-gray-600"
                        }`}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`font-semibold ${
                            isSelected ? "text-blue-900" : "text-gray-900"
                          }`}
                        >
                          {method.name}
                        </h3>
                        {method.isPopular && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-green-100 text-green-700"
                          >
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p
                        className={`text-sm ${
                          isSelected ? "text-blue-700" : "text-gray-600"
                        }`}
                      >
                        {method.description}
                      </p>

                      {method.providers && method.providers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {method.providers
                            .slice(0, 4)
                            .map((provider, index) => (
                              <span
                                key={provider}
                                className={`text-xs px-2 py-1 rounded ${
                                  isSelected
                                    ? "bg-blue-200 text-blue-800"
                                    : "bg-gray-200 text-gray-700"
                                }`}
                              >
                                {provider}
                              </span>
                            ))}
                          {method.providers.length > 4 && (
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                isSelected
                                  ? "bg-blue-200 text-blue-800"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              +{method.providers.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
        <div className="flex items-start space-x-2">
          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check className="w-3 h-3 text-green-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-green-900 mb-1">
              Secure Payment
            </h4>
            <p className="text-sm text-green-700">
              All payments are secured with 256-bit SSL encryption. Your payment
              information is never stored on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
