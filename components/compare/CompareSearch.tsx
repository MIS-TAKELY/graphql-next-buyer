"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";
import { useQuery } from "@apollo/client";
import { MAKE_SEARCH_QUERY } from "@/client/search/search.query";
import { useCompareStore } from "@/store/compareStore";
import { CompareProduct } from "@/types/compare.types";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export default function CompareSearch() {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [showResults, setShowResults] = useState(false);
    const { addProduct, selectedProducts } = useCompareStore();

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data, loading } = useQuery(MAKE_SEARCH_QUERY, {
        variables: {
            query: debouncedQuery,
            page: 1,
            limit: 5,
        },
        skip: debouncedQuery.length < 2,
    });

    const searchResults = data?.searchProducts?.products || [];

    const handleAddProduct = (product: CompareProduct) => {
        const added = addProduct(product);
        if (added) {
            toast.success(`${product.name} added to comparison`);
            setSearchQuery("");
            setShowResults(false);
        } else {
            if (selectedProducts.some((p) => p.id === product.id)) {
                toast.info("Product already in comparison");
            } else {
                toast.error("Maximum 4 products can be compared");
            }
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setShowResults(false);
        if (showResults) {
            document.addEventListener("click", handleClickOutside);
            return () => document.removeEventListener("click", handleClickOutside);
        }
    }, [showResults]);

    return (
        <div className="relative w-full max-w-2xl mx-auto" onClick={(e) => e.stopPropagation()}>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Search products to add to comparison..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                    className="pl-10 pr-10 h-12 text-base"
                    aria-label="Search products"
                />
                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && debouncedQuery.length >= 2 && (
                <Card className="absolute top-full mt-2 w-full z-50 max-h-96 overflow-y-auto shadow-xl">
                    <CardContent className="p-2">
                        {loading ? (
                            <div className="flex items-center justify-center py-8 text-gray-500">
                                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                Searching...
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No products found
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {searchResults.map((product: CompareProduct) => {
                                    const variant = product.variants[0];
                                    const isAlreadySelected = selectedProducts.some((p) => p.id === product.id);

                                    return (
                                        <button
                                            key={product.id}
                                            onClick={() => handleAddProduct(product)}
                                            disabled={isAlreadySelected}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${isAlreadySelected
                                                ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60"
                                                : "hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                                                }`}
                                        >
                                            {/* Product Image */}
                                            <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded">
                                                <Image
                                                    src={product.images[0]?.url || "/placeholder.svg"}
                                                    alt={product.images[0]?.altText || product.name}
                                                    fill
                                                    className="object-contain p-1"
                                                    unoptimized
                                                />
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">
                                                    {product.name}
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {product.brand || product.category.name}
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                                                    {formatPrice(variant.price)}
                                                </p>
                                            </div>

                                            {/* Already Selected Badge */}
                                            {isAlreadySelected && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                                    Already added
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
