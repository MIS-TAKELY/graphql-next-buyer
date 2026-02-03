"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCompareStore } from "@/store/compareStore";
import CompareHeader from "@/components/compare/CompareHeader";
import CompareTable from "@/components/compare/CompareTable";
import CompareSearch from "@/components/compare/CompareSearch";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ComparePage() {
    const router = useRouter();
    const { selectedProducts } = useCompareStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Show loading skeleton or nothing while hydrating
    if (!isMounted) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-pulse" />
        );
    }

    // Empty state instead of redirect
    if (selectedProducts.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <CompareHeader />
                <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ArrowLeft className="w-8 h-8 rotate-90" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Compare Products
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                            Your comparison list is empty. Search and add products below to see a detailed side-by-side comparison.
                        </p>

                        <div className="max-w-xl mx-auto mb-10">
                            <CompareSearch />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                onClick={() => router.push("/search")}
                                variant="outline"
                                className="w-full sm:w-auto"
                            >
                                Browse All Products
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <CompareHeader />

            {/* Main Content */}
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Search Bar */}
                <div className="mb-6">
                    <CompareSearch />
                </div>

                {/* Comparison Table */}
                <CompareTable />
            </div>
        </div>
    );
}
