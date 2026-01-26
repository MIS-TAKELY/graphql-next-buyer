// components/page/checkout/PaymentMethodSelector.tsx
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
    description: "Esewa, Khalti, IME Pay, PhonePe",
    providers: ["Esewa", "Khalti", "IME Pay", "PhonePe"],
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
      <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Choose your preferred payment method
      </div>

      <div className="grid gap-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selected?.id === method.id;

          return (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 ${isSelected
                  ? "ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "hover:border-gray-400 dark:hover:border-gray-500"
                }`}
              onClick={() => handleMethodSelect(method)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-lg ${isSelected ? "bg-blue-100 dark:bg-blue-900/30" : "bg-gray-100 dark:bg-gray-700"
                        }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300"
                          }`}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`font-semibold ${isSelected ? "text-blue-900 dark:text-blue-200" : "text-gray-900 dark:text-white"
                            }`}
                        >
                          {method.name}
                        </h3>
                        {method.isPopular && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                          >
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p
                        className={`text-sm ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-300"
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
                                className={`text-xs px-2 py-1 rounded ${isSelected
                                    ? "bg-blue-200 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                  }`}
                              >
                                {provider}
                              </span>
                            ))}
                          {method.providers.length > 4 && (
                            <span
                              className={`text-xs px-2 py-1 rounded ${isSelected
                                  ? "bg-blue-200 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
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
                      <div className="w-6 h-6 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center">
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
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-600 rounded-lg p-4 mt-6">
        <div className="flex items-start space-x-2">
          <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-green-900 dark:text-green-200 mb-1">
              Secure Payment
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              All payments are secured with 256-bit SSL encryption. Your payment
              information is never stored on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}