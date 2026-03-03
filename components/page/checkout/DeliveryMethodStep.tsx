"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, CheckCircle2 } from "lucide-react";
import { IDeliveryOption } from "@/types/product";

interface DeliveryMethodStepProps {
    deliveryOptions: IDeliveryOption[];
    selectedMethod: IDeliveryOption | null;
    onSelect: (method: IDeliveryOption) => void;
    onBack: () => void;
}

export function DeliveryMethodStep({
    deliveryOptions,
    selectedMethod,
    onSelect,
    onBack,
}: DeliveryMethodStepProps) {
    // If no delivery options are provided by the seller, we can default to a standard one
    const options = deliveryOptions.length > 0
        ? deliveryOptions
        : [{ title: "Standard Delivery", description: "3-5 Business Days" }] as IDeliveryOption[];

    return (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Truck className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    Choose Delivery Method
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {options.map((option, index) => {
                        const isSelected = selectedMethod?.title === option.title;
                        return (
                            <div
                                key={index}
                                onClick={() => onSelect(option)}
                                className={`flex items-start justify-between p-4 border rounded-lg cursor-pointer transition-all ${isSelected
                                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                    }`}
                            >
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                        {option.title}
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {option.description}
                                    </p>
                                </div>
                                {isSelected && (
                                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={onBack}>
                        Back to Address
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
