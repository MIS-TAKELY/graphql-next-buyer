"use client";

import React from "react";
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

    if (selectedProducts.length === 0) {
        return null;
    }

    // Extract common features
    const getProductFeatures = (product: CompareProduct) => {
        const variant = product.variants?.[0] || { price: 0, mrp: 0, specifications: [] };
        const avgRating =
            product.reviews?.length > 0
                ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
                product.reviews.length
                : 0;
        const discount =
            variant.mrp > variant.price
                ? Math.round(((variant.mrp - variant.price) / variant.mrp) * 100)
                : 0;

        return {
            price: variant.price,
            mrp: variant.mrp,
            discount,
            rating: avgRating,
            reviewCount: product.reviews?.length || 0,
            brand: product.brand || "",
            category: product.category?.name || "",
            description: product.description || "",
            features: product.features || [],
            specifications: variant.specifications || [],
        };
    };

    // Get all unique specification indices across all products
    const maxSpecsCount = Math.max(
        ...selectedProducts.map((p) => p.variants?.[0]?.specifications?.length || 0),
        0
    );

    // Get all variants count
    const maxVariantsCount = Math.max(
        ...selectedProducts.map((p) => p.variants?.length || 0),
        0
    );

    const handleRemove = (productId: string) => {
        removeProduct(productId);
        toast.success("Product removed from comparison");
    };

    return (
        <>
            {/* Desktop: Side-by-side table */}
            <div className="hidden md:block overflow-x-auto">
                <div className="min-w-full inline-block align-middle">
                    <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${selectedProducts.length}, 1fr)` }}>
                        {/* Header Row - Product Images and Names */}
                        <div className="font-semibold text-gray-700 dark:text-gray-300 flex items-end pb-4">
                            Product
                        </div>
                        {selectedProducts.map((product) => (
                            <Card key={product.id} className="relative">
                                <CardContent className="p-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemove(product.id)}
                                        className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                        aria-label={`Remove ${product.name}`}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <div className="relative w-full h-40 mb-3 bg-gray-50 dark:bg-gray-800 rounded">
                                        <Image
                                            src={product.images[0]?.url || "/placeholder.svg"}
                                            alt={product.images[0]?.altText || product.name}
                                            fill
                                            className="object-contain p-2"
                                        />
                                    </div>
                                    <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 dark:text-white">
                                        {product.name}
                                    </h3>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Description Row */}
                        <div className="font-medium text-gray-700 dark:text-gray-300 py-3 border-t">
                            Description
                        </div>
                        {selectedProducts.map((product) => {
                            const features = getProductFeatures(product);
                            return (
                                <div key={product.id} className="py-3 border-t text-sm text-gray-900 dark:text-white">
                                    <p className="line-clamp-3">{features.description || "-"}</p>
                                </div>
                            );
                        })}

                        {/* Features Row */}
                        <div className="font-medium text-gray-700 dark:text-gray-300 py-3 border-t">
                            Features
                        </div>
                        {selectedProducts.map((product) => {
                            const features = getProductFeatures(product);
                            return (
                                <div key={product.id} className="py-3 border-t text-sm text-gray-900 dark:text-white">
                                    {features.features.length > 0 ? (
                                        <ul className="list-disc list-inside space-y-1">
                                            {features.features.map((feature, i) => (
                                                <li key={i} className="line-clamp-2">{feature}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        "-"
                                    )}
                                </div>
                            );
                        })}

                        {/* Price Row */}
                        <div className="font-medium text-gray-700 dark:text-gray-300 py-3 border-t">
                            Price
                        </div>
                        {selectedProducts.map((product) => {
                            const features = getProductFeatures(product);
                            const isLowest = features.price === Math.min(...selectedProducts.map(p => getProductFeatures(p).price));
                            return (
                                <div key={product.id} className="py-3 border-t">
                                    <div className={`text-xl font-bold ${isLowest ? "text-green-600 dark:text-green-500" : "text-gray-900 dark:text-white"}`}>
                                        {formatPrice(features.price)}
                                    </div>
                                    {features.discount > 0 && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 line-through">
                                            {formatPrice(features.mrp)}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* MRP Row */}
                        <div className="font-medium text-gray-700 dark:text-gray-300 py-3 border-t">
                            MRP
                        </div>
                        {selectedProducts.map((product) => {
                            const features = getProductFeatures(product);
                            return (
                                <div key={product.id} className="py-3 border-t text-sm text-gray-900 dark:text-white">
                                    {formatPrice(features.mrp)}
                                </div>
                            );
                        })}

                        {/* Discount Row */}
                        <div className="font-medium text-gray-700 dark:text-gray-300 py-3 border-t">
                            Discount
                        </div>
                        {selectedProducts.map((product) => {
                            const features = getProductFeatures(product);
                            const isHighest = features.discount === Math.max(...selectedProducts.map(p => getProductFeatures(p).discount));
                            return (
                                <div key={product.id} className="py-3 border-t">
                                    {features.discount > 0 ? (
                                        <Badge className={`${isHighest ? "bg-green-600" : "bg-gray-600"}`}>
                                            {features.discount}% OFF
                                        </Badge>
                                    ) : (
                                        <span className="text-sm text-gray-500">-</span>
                                    )}
                                </div>
                            );
                        })}

                        {/* Rating Row */}
                        <div className="font-medium text-gray-700 dark:text-gray-300 py-3 border-t">
                            Rating
                        </div>
                        {selectedProducts.map((product) => {
                            const features = getProductFeatures(product);
                            const isHighest = features.rating === Math.max(...selectedProducts.map(p => getProductFeatures(p).rating));
                            return (
                                <div key={product.id} className="py-3 border-t">
                                    {features.rating > 0 ? (
                                        <div className="flex items-center gap-2">
                                            <span className={`flex items-center gap-1 ${isHighest ? "text-green-600 dark:text-green-500 font-bold" : "text-gray-900 dark:text-white"}`}>
                                                {features.rating.toFixed(1)}
                                                <Star className="w-4 h-4 fill-current" />
                                            </span>
                                            <span className="text-xs text-gray-500">({features.reviewCount})</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-500">No reviews</span>
                                    )}
                                </div>
                            );
                        })}

                        {/* Brand Row */}
                        <div className="font-medium text-gray-700 dark:text-gray-300 py-3 border-t">
                            Brand
                        </div>
                        {selectedProducts.map((product) => {
                            const features = getProductFeatures(product);
                            return (
                                <div key={product.id} className="py-3 border-t text-sm text-gray-900 dark:text-white">
                                    {features.brand || "-"}
                                </div>
                            );
                        })}

                        {/* Category Row */}
                        <div className="font-medium text-gray-700 dark:text-gray-300 py-3 border-t">
                            Category
                        </div>
                        {selectedProducts.map((product) => {
                            const features = getProductFeatures(product);
                            return (
                                <div key={product.id} className="py-3 border-t text-sm text-gray-900 dark:text-white">
                                    {features.category}
                                </div>
                            );
                        })}

                        {/* Number of Variants Row */}
                        <div className="font-medium text-gray-700 dark:text-gray-300 py-3 border-t">
                            Variants Available
                        </div>
                        {selectedProducts.map((product) => (
                            <div key={product.id} className="py-3 border-t text-sm text-gray-900 dark:text-white">
                                {product.variants?.length || 0} variant{product.variants?.length !== 1 ? 's' : ''}
                            </div>
                        ))}

                        {/* All Specifications - Show ALL specs, not just first 5 */}
                        {Array.from({ length: maxSpecsCount }).map((_, specIndex) => (
                            <React.Fragment key={`spec-${specIndex}`}>
                                <div className="font-medium text-gray-700 dark:text-gray-300 py-3 border-t">
                                    Specification {specIndex + 1}
                                </div>
                                {selectedProducts.map((product) => {
                                    const spec = product.variants[0]?.specifications[specIndex];
                                    return (
                                        <div key={`${product.id}-spec-${specIndex}`} className="py-3 border-t text-sm text-gray-900 dark:text-white">
                                            {spec?.value || "-"}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile: Vertical stacked cards */}
            <div className="md:hidden space-y-4">
                {selectedProducts.map((product) => {
                    const features = getProductFeatures(product);
                    return (
                        <Card key={product.id} className="relative">
                            <CardContent className="p-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemove(product.id)}
                                    className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                    aria-label={`Remove ${product.name}`}
                                >
                                    <X className="h-4 w-4" />
                                </Button>

                                {/* Product Image */}
                                <div className="relative w-full h-48 mb-4 bg-gray-50 dark:bg-gray-800 rounded">
                                    <Image
                                        src={product.images[0]?.url || "/placeholder.svg"}
                                        alt={product.images[0]?.altText || product.name}
                                        fill
                                        className="object-contain p-4"
                                    />
                                </div>

                                {/* Product Name */}
                                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
                                    {product.name}
                                </h3>

                                {/* Features */}
                                <div className="space-y-3">
                                    {/* Description */}
                                    {features.description && (
                                        <div className="pb-2 border-b">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">Description</span>
                                            <p className="text-sm text-gray-900 dark:text-white">{features.description}</p>
                                        </div>
                                    )}

                                    {/* Features */}
                                    {features.features.length > 0 && (
                                        <div className="pb-2 border-b">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">Features</span>
                                            <ul className="list-disc list-inside space-y-1">
                                                {features.features.map((feature, i) => (
                                                    <li key={i} className="text-sm text-gray-900 dark:text-white line-clamp-2">{feature}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pb-2 border-b">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Price</span>
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(features.price)}</span>
                                    </div>

                                    <div className="flex justify-between items-center pb-2 border-b">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">MRP</span>
                                        <span className="text-sm text-gray-900 dark:text-white">{formatPrice(features.mrp)}</span>
                                    </div>

                                    {features.discount > 0 && (
                                        <div className="flex justify-between items-center pb-2 border-b">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Discount</span>
                                            <Badge className="bg-green-600">{features.discount}% OFF</Badge>
                                        </div>
                                    )}

                                    {features.rating > 0 && (
                                        <div className="flex justify-between items-center pb-2 border-b">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Rating</span>
                                            <span className="flex items-center gap-1 text-gray-900 dark:text-white">
                                                {features.rating.toFixed(1)}
                                                <Star className="w-4 h-4 fill-current" />
                                                <span className="text-xs text-gray-500">({features.reviewCount})</span>
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pb-2 border-b">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Brand</span>
                                        <span className="text-sm text-gray-900 dark:text-white">{features.brand || "-"}</span>
                                    </div>

                                    <div className="flex justify-between items-center pb-2 border-b">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Category</span>
                                        <span className="text-sm text-gray-900 dark:text-white">{features.category}</span>
                                    </div>

                                    <div className="flex justify-between items-center pb-2 border-b">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Variants Available</span>
                                        <span className="text-sm text-gray-900 dark:text-white">
                                            {product.variants?.length || 0} variant{product.variants?.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {/* All Specifications */}
                                    {features.specifications.map((spec, idx) => (
                                        <div key={idx} className="flex justify-between items-start pb-2 border-b">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Spec {idx + 1}</span>
                                            <span className="text-sm text-gray-900 dark:text-white text-right">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </>
    );
}
