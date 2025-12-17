"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCompareStore } from "@/store/compareStore";

export default function CompareHeader() {
    const router = useRouter();
    const { selectedProducts, clearAll } = useCompareStore();
    const count = selectedProducts.length;

    return (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Title and Count */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="gap-2"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Back</span>
                        </Button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                Product Comparison
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Comparing {count} {count === 1 ? "product" : "products"}
                            </p>
                        </div>
                    </div>

                    {/* Clear All Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAll}
                        disabled={count === 0}
                        className="w-full sm:w-auto"
                    >
                        Clear All
                    </Button>
                </div>
            </div>
        </div>
    );
}
