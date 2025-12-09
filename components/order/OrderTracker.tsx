// components/order/OrderTracker.tsx
"use client";

import { Check, Clock, Package, Truck, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderTrackerProps {
    status: "PENDING" | "PROCESSING" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED";
}

const STEPS = [
    { id: "PENDING", label: "Order Placed", icon: Clock },
    { id: "PROCESSING", label: "Packed", icon: Package },
    { id: "SHIPPED", label: "Shipped", icon: Truck },
    { id: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: MapPin },
    { id: "DELIVERED", label: "Delivered", icon: Check },
];

export default function OrderTracker({ status }: OrderTrackerProps) {
    const currentStepIndex = STEPS.findIndex((step) => step.id === status);
    // Default to 0 if status not found, or handle cancelled/returned logic separately
    const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

    return (
        <div className="w-full py-6">
            <div className="relative flex justify-between items-center w-full">
                {STEPS.map((step, index) => {
                    const isCompleted = index <= activeIndex;
                    const isCurrent = index === activeIndex;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center flex-1">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-background",
                                    isCompleted
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-muted-foreground/30 text-muted-foreground"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                            </div>
                            <span
                                className={cn(
                                    "text-xs mt-2 font-medium text-center hidden sm:block",
                                    isCompleted ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}

                {/* Connection Line */}
                <div className="absolute top-5 left-0 w-full h-[2px] bg-muted -z-0">
                    <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
