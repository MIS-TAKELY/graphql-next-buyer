"use client";

import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Star } from "lucide-react";
import Image from "next/image";
import { useCompareStore } from "@/store/compareStore";
import { CompareProduct } from "@/types/compare.types";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export default function CompareTable() {
    const { selectedProducts, removeProduct } = useCompareStore();

    // Flatten all product data into a unified structure for comparison
    const preparedData = useMemo(() => {
        if (selectedProducts.length === 0) return null;

        const allFeatureKeys = new Set<string>();
        const featureLabels = new Map<string, string>(); // key -> display label

        // Map to store processed features for each product
        const productFeatures = new Map<string, Map<string, any>>();

        selectedProducts.forEach(product => {
            const features = new Map<string, any>();

            // 1. Standard Fields
            features.set('price', product.variants?.[0]?.price || 0);
            features.set('mrp', product.variants?.[0]?.mrp || 0);
            features.set('rating', product.reviews?.length ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length : 0);
            features.set('reviewCount', product.reviews?.length || 0);
            features.set('brand', typeof product.brand === 'string' ? product.brand : product.brand?.name || '-');
            features.set('category', product.category?.name || '-');
            features.set('description', product.description || '-');

            // 2. Variant Attributes (e.g., Color, Size)
            const attributes = product.variants?.[0]?.attributes;
            if (attributes) {
                Object.entries(attributes).forEach(([key, value]) => {
                    if (typeof value === 'string') {
                        const compositeKey = `attr_${key}`;
                        features.set(compositeKey, value);
                        allFeatureKeys.add(compositeKey);
                        featureLabels.set(compositeKey, key.charAt(0).toUpperCase() + key.slice(1));
                    }
                });
            }

            // 3. Specification Table (Rich Specs)
            if (product.specificationTable) {
                product.specificationTable.forEach(table => {
                    table.rows.forEach(row => {
                        if (Array.isArray(row) && row.length >= 2) {
                            const [key, value] = row;
                            const compositeKey = `spec_${key}`;
                            features.set(compositeKey, value);
                            allFeatureKeys.add(compositeKey);
                            featureLabels.set(compositeKey, key);
                        }
                    });
                });
            }

            // 4. Category Specifications
            if (product.category?.categorySpecification) {
                product.category.categorySpecification.forEach(spec => {
                    const compositeKey = `catspec_${spec.key}`;
                    features.set(compositeKey, spec.value || '-');
                    allFeatureKeys.add(compositeKey);
                    featureLabels.set(compositeKey, spec.label || spec.key);
                });
            }

            // 5. Legacy Features/Specs (Fallback)
            if (product.features && product.features.length > 0) {
                features.set('highlights', product.features);
                allFeatureKeys.add('highlights');
                featureLabels.set('highlights', 'Highlights');
            }
            if (!product.specificationTable && product.variants?.[0]?.specifications) {
                product.variants[0].specifications.forEach((spec, idx) => {
                    const compositeKey = `legacy_spec_${idx}`;
                    features.set(compositeKey, spec.value);
                    allFeatureKeys.add(compositeKey);
                    featureLabels.set(compositeKey, `Specification ${idx + 1}`);
                });
            }

            productFeatures.set(product.id, features);
        });

        // Group Features: Common vs Uncommon
        const commonFeatures: string[] = [];
        const uncommonFeatures: string[] = [];

        allFeatureKeys.forEach(key => {
            // Check if every selected product has a value for this key
            const isCommon = selectedProducts.every(p => {
                const pFeatures = productFeatures.get(p.id);
                const val = pFeatures?.get(key);
                return val !== undefined && val !== null && val !== '-' && val !== '';
            });

            if (isCommon) {
                commonFeatures.push(key);
            } else {
                uncommonFeatures.push(key);
            }
        });

        // Sort keys alphabetically for consistency within groups
        commonFeatures.sort((a, b) => (featureLabels.get(a) || a).localeCompare(featureLabels.get(b) || b));
        uncommonFeatures.sort((a, b) => (featureLabels.get(a) || a).localeCompare(featureLabels.get(b) || b));

        return {
            productFeatures,
            commonFeatures,
            uncommonFeatures,
            featureLabels
        };

    }, [selectedProducts]);

    if (!selectedProducts.length || !preparedData) return null;

    const { productFeatures, commonFeatures, uncommonFeatures, featureLabels } = preparedData;

    const handleRemove = (productId: string) => {
        removeProduct(productId);
        toast.success("Product removed from comparison");
    };

    const renderFeatureRow = (key: string) => (
        <React.Fragment key={key}>
            <div className="font-medium text-gray-700 dark:text-gray-300 py-3 border-t">
                {featureLabels.get(key) || key}
            </div>
            {selectedProducts.map(product => {
                const val = productFeatures.get(product.id)?.get(key);
                return (
                    <div key={`${product.id}-${key}`} className="py-3 border-t text-sm text-gray-900 dark:text-white">
                        {Array.isArray(val) ? (
                            <ul className="list-disc list-inside">
                                {val.map((v, i) => <li key={i}>{v}</li>)}
                            </ul>
                        ) : (
                            val || "-"
                        )}
                    </div>
                );
            })}
        </React.Fragment>
    );

    return (
        <>
            {/* Desktop: Side-by-side table */}
            <div className="hidden md:block overflow-x-auto">
                <div className="min-w-full inline-block align-middle">
                    <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${selectedProducts.length}, 1fr)` }}>

                        {/* 1. Header Row (Image, Name, Remove) */}
                        <div className="font-semibold text-gray-700 dark:text-gray-300 flex items-end pb-4">
                            Product
                        </div>
                        {selectedProducts.map((product) => (
                            <Card key={product.id} className="relative border-none shadow-none bg-transparent">
                                <CardContent className="p-0">
                                    <div className="relative group">
                                        <div className="relative w-full h-40 mb-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-2">
                                            <Image
                                                src={product.images[0]?.url || "/placeholder.svg"}
                                                alt={product.images[0]?.altText || product.name}
                                                fill
                                                className="object-contain"
                                                unoptimized
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemove(product.id)}
                                                className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white shadow-md hover:bg-red-50 hover:text-red-600 dark:bg-gray-700 dark:hover:bg-red-900/40 z-10"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 dark:text-white" title={product.name}>
                                        {product.name}
                                    </h3>
                                </CardContent>
                            </Card>
                        ))}

                        {/* 2. Core Info (Price, Brand, Rating) - ALWAYS TOP */}

                        {/* Price */}
                        <div className="font-medium text-gray-700 dark:text-gray-300 py-3 border-t">Price</div>
                        {selectedProducts.map(product => {
                            const price = productFeatures.get(product.id)?.get('price');
                            const mrp = productFeatures.get(product.id)?.get('mrp');
                            const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
                            const isLowest = price === Math.min(...selectedProducts.map(p => productFeatures.get(p.id)?.get('price') || Infinity));

                            return (
                                <div key={product.id} className="py-3 border-t">
                                    <div className={`text-xl font-bold ${isLowest ? "text-green-600 dark:text-green-500" : "text-gray-900 dark:text-white"}`}>
                                        {formatPrice(price)}
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex gap-2 items-center mt-1">
                                            <span className="text-xs text-gray-500 line-through">{formatPrice(mrp)}</span>
                                            <Badge variant="secondary" className="text-[10px] h-5 px-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                {discount}% OFF
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        {/* Rating */}
                        <div className="font-medium text-gray-700 dark:text-gray-300 py-3 border-t">Rating</div>
                        {selectedProducts.map(product => {
                            const rating = productFeatures.get(product.id)?.get('rating') || 0;
                            const count = productFeatures.get(product.id)?.get('reviewCount') || 0;
                            return (
                                <div key={product.id} className="py-3 border-t text-sm">
                                    {rating > 0 ? (
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex items-center bg-green-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                                                {rating.toFixed(1)} <Star className="w-3 h-3 fill-current ml-0.5" />
                                            </div>
                                            <span className="text-gray-500 text-xs">({count})</span>
                                        </div>
                                    ) : <span className="text-gray-400">-</span>}
                                </div>
                            )
                        })}

                        {/* Brand */}
                        <div className="font-medium text-gray-700 dark:text-gray-300 py-3 border-t">Brand</div>
                        {selectedProducts.map(product => (
                            <div key={product.id} className="py-3 border-t text-sm text-gray-900 dark:text-white">
                                {productFeatures.get(product.id)?.get('brand')}
                            </div>
                        ))}

                        {/* 3. Section Divider: Common Features */}
                        {commonFeatures.length > 0 && (
                            <>
                                <div className="col-span-full py-4 mt-4 mb-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    Common Features
                                </div>
                                {commonFeatures.map(key => renderFeatureRow(key))}
                            </>
                        )}

                        {/* 4. Section Divider: Other Features */}
                        {uncommonFeatures.length > 0 && (
                            <>
                                <div className="col-span-full py-4 mt-4 mb-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    Other Features
                                </div>
                                {uncommonFeatures.map(key => renderFeatureRow(key))}
                            </>
                        )}

                    </div>
                </div>
            </div>

            {/* Mobile View - Stacked Cards (Simplified for now) */}
            <div className="md:hidden space-y-6">
                {selectedProducts.map(product => (
                    <Card key={product.id} className="relative">
                        <Button onClick={() => handleRemove(product.id)} variant="ghost" className="absolute top-2 right-2 p-1 h-auto"><X className="w-4 h-4" /></Button>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex gap-4">
                                <div className="relative w-24 h-24 bg-gray-50 rounded shrink-0">
                                    <Image src={product.images[0]?.url || "/placeholder.svg"} alt={product.name} fill className="object-contain p-1" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm line-clamp-2">{product.name}</h3>
                                    <div className="mt-2 font-bold text-lg">{formatPrice(productFeatures.get(product.id)?.get('price'))}</div>
                                </div>
                            </div>

                            <div className="border-t pt-2 space-y-2">
                                {[...commonFeatures, ...uncommonFeatures].slice(0, 5).map(key => {
                                    const val = productFeatures.get(product.id)?.get(key);
                                    if (!val || val === '-') return null;
                                    return (
                                        <div key={key} className="flex justify-between text-sm">
                                            <span className="text-gray-500">{featureLabels.get(key) || key}</span>
                                            <span className="font-medium text-right max-w-[60%]">{Array.isArray(val) ? val.length + " items" : val}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <div className="text-center text-sm text-gray-500 italic">
                    View on desktop for detailed feature comparison
                </div>
            </div>
        </>
    );
}
