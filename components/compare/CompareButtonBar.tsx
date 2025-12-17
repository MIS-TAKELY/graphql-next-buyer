"use client";

import { Button } from "@/components/ui/button";
import { useCompareStore } from "@/store/compareStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";

export default function CompareButtonBar() {
    const { selectedProducts, clearAll, getCount } = useCompareStore();
    const router = useRouter();
    const count = getCount();

    // Don't render if no products selected
    if (count === 0) return null;

    const handleCompare = () => {
        if (count < 2) {
            toast.error("Please select at least 2 products to compare");
            return;
        }
        router.push("/compare");
    };

    const handleDeselectAll = () => {
        clearAll();
        toast.success("All products deselected");
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col sm:flex-row gap-3 items-end sm:items-center">
            {/* Mobile: Stacked FAB style, Desktop: Horizontal group */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 shadow-2xl rounded-lg bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700">
                {/* Deselect All Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAll}
                    className="min-h-[44px] min-w-[44px] sm:min-w-0 gap-2 font-medium"
                    aria-label="Deselect all products"
                >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Deselect All</span>
                </Button>

                {/* Compare Button */}
                <Button
                    size="sm"
                    onClick={handleCompare}
                    className="min-h-[44px] min-w-[44px] sm:min-w-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2"
                    aria-label={`Compare ${count} products`}
                >
                    <span>Compare</span>
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {count}
                    </span>
                </Button>
            </div>
        </div>
    );
}
