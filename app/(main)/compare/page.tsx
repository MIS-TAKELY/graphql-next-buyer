"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCompareStore } from "@/store/compareStore";
import CompareHeader from "@/components/compare/CompareHeader";
import CompareTable from "@/components/compare/CompareTable";
import CompareSearch from "@/components/compare/CompareSearch";
import { toast } from "sonner";

export default function ComparePage() {
    const router = useRouter();
    const { selectedProducts } = useCompareStore();

    // Redirect if no products selected
    useEffect(() => {
        if (selectedProducts.length === 0) {
            toast.error("Please select at least 2 products to compare");
            router.push("/search");
        }
    }, [selectedProducts.length, router]);

    // Don't render if no products
    if (selectedProducts.length === 0) {
        return null;
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
