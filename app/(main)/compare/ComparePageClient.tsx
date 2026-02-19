"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCompareStore } from "@/store/compareStore";
import CompareHeader from "@/components/compare/CompareHeader";
import CompareTable from "@/components/compare/CompareTable";
import CompareSearch from "@/components/compare/CompareSearch";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSmartSpecificationMapping } from "@/app/actions/compareActions";

export default function ComparePage() {
    const router = useRouter();
    const { selectedProducts } = useCompareStore();
    const [isMounted, setIsMounted] = useState(false);
    const [smartMapping, setSmartMapping] = useState<Record<string, string>>({});
    const [isLoadingMapping, setIsLoadingMapping] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Fetch smart mapping when selected products change
    useEffect(() => {
        if (!isMounted || selectedProducts.length === 0) return;

        const fetchMapping = async () => {
            setIsLoadingMapping(true);
            try {
                // Collect all raw keys from selected products
                const rawKeys = new Set<string>();
                selectedProducts.forEach(product => {
                    // Variant attributes
                    if (product.variants?.[0]?.attributes) {
                        Object.keys(product.variants[0].attributes).forEach(k => rawKeys.add(k));
                    }
                    // Specifications
                    if (product.variants?.[0]?.specifications) {
                        product.variants[0].specifications.forEach((s: any) => {
                            if (s.key) rawKeys.add(s.key);
                        });
                    }
                    // Table rows
                    if (Array.isArray(product.specificationTable)) {
                        product.specificationTable.forEach((table: any) => {
                            if (Array.isArray(table?.rows)) {
                                table.rows.forEach((row: any) => {
                                    if (Array.isArray(row) && row[0]) rawKeys.add(row[0]);
                                });
                            }
                        });
                    }
                });

                if (rawKeys.size > 0) {
                    const mapping = await getSmartSpecificationMapping(Array.from(rawKeys));
                    setSmartMapping(mapping);
                }
            } catch (error) {
                console.error("Failed to fetch smart mapping:", error);
            } finally {
                setIsLoadingMapping(false);
            }
        };

        fetchMapping();
    }, [selectedProducts, isMounted]);

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
                <div className="relative">
                    {isLoadingMapping && (
                        <div className="absolute top-0 right-0 z-10 flex items-center gap-2 bg-white/80 dark:bg-gray-900/80 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Optimizing comparison...</span>
                        </div>
                    )}
                    <CompareTable smartMapping={smartMapping} />
                </div>
            </div>
        </div>
    );
}
