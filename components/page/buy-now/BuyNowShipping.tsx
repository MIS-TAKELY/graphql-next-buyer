// components/page/buy-now/BuyNowShipping.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Truck } from "lucide-react";
import { AddAddressForm } from "@/components/address";

export function BuyNowShipping({ onSubmit }: { onSubmit: (addr: any) => void }) {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Truck className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          Shipping Address
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AddAddressForm onSave={onSubmit} context="buy-now" />
      </CardContent>
    </Card>
  );
}