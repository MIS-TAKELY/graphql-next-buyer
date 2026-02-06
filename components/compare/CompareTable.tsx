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

const normalizeKey = (key: string) => {
    return key.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim();
};

const guessLabel = (value: string) => {
    const v = value.toLowerCase();

    // Special hardware keywords with high probability
    if (/\b(acer|nitro|macbook|thinkpad|inspiron|pavilion|laptop|desktop|anv\d+)\b/.test(v)) return 'Model Series';
    if (/\b(rtx|gtx|geforce|radeon|arc\b|iris|integrated|gpu|graphics|nvidia)\b/.test(v)) return 'Graphics';
    if (/\b(ryzen|intel|core|i3|i5|i7|i9|athlon|celeron|pentium|r3\b|r5\b|r7\b|r9\b|8\d{3}[hsu])\b/.test(v)) return 'Processor';
    if (/\b(cooling|fan\b|thermal|vapor chamber|liquid metal|heat pipe)\b/.test(v)) return 'Cooling System';
    if (/\b(backlit|keyboard|numpad|trackpad|touchpad)\b/.test(v)) return 'Keyboard & Input';
    if (/\b(ips|panel|uhd|qhd|fhd|4k|2\.5k|8k|1080p|1440p|2160p|refresh rate|[\d\.]+\s*[\u00d7x]\s*[\d\.]+|ratio|80%)\b/.test(v)) return 'Display Details';
    if (/\b(ssd|hdd|nvme|m\.2|sata)\b/.test(v)) return 'Storage Type';
    if (/\b(aluminum|plastic|metal|opening angle|degree|angle)\b/.test(v)) return 'Physical Build';

    // Higher priority specific features
    if (/\b(s pen|galaxy ai|vision booster|adaptive color tone)\b/.test(v)) return 'Special Features';
    if (/\b(midnight|moonlight|lime green|lilac blue|silverblue|jetblack|gold|white|black|color|finish)\b/.test(v)) return 'Colors Available';

    if (/\b(january|february|march|april|may|june|july|august|september|october|november|december|202\d)\b/.test(v)) return 'Release Date';
    if (/\b(mah|wh|battery|charging|wired|wireless|capacity|rechargeable|li-ion|cell)\b/.test(v)) return 'Battery & Power';
    if (/\b(px|resolution|hz\b|amoled|oled|lcd|nits|brightness|display|screen|inch|diagonal)\b/.test(v)) return 'Display';
    if (/\b(snapdragon|exynos|bionic|octa-core|quad-core|ghz|processor|cpu|chipset|soc|mediatek|dimensity)\b/.test(v)) return 'Processor';
    if (/\b(ram|rom|gb|tb|storage|memory|microsd)\b/.test(v)) return 'Memory & Storage';

    // Avoid guessing "Camera" for control-related text
    if (/\b(camera|zoom|ois|lens|sensor|selfie|aperture)\b|mp\b/.test(v) && !/\b(control|tap|playback|gesture)\b/.test(v)) return 'Camera';

    if (/\b(5g|4g|lte|wi-fi|wifi|bluetooth|nfc|gps|sim|esim|volte|uwb)\b/.test(v)) return 'Connectivity';
    if (/\b(android|ios|windows|macos|ui|os|software|firmware|one ui|harmonyos)\b/.test(v)) return 'Software & OS';
    if (/\b(mm|g|kg|dimensions|weight|thickness|width|height|depth|form factor)\b/.test(v)) return 'Physical Design';
    if (/\b(water|ip6\d|ipx\d|dust|resistance|durability|gorilla glass|titanium|armor)\b/.test(v)) return 'Build & Durability';
    if (/\b(sensor|fingerprint|accelerometer|gyro|proximity|compass|barometer|lidar)\b/.test(v)) return 'Sensors';
    if (/\b(stereo|audio|dolby|atmos|speakers|mic|microphone|driver|hi-res|aptx|codec|db\b|hz\b|earbuds|earphone|binural)\b/.test(v)) return 'Audio & Sound';
    if (/\b(control|touch|tap|playback|double-tap|gesture)\b/.test(v)) return 'Controls';

    return null;
};

export default function CompareTable() {
    const { selectedProducts, removeProduct } = useCompareStore();

    // Flatten all product data into a unified structure for comparison
    const preparedData = useMemo(() => {
        if (selectedProducts.length === 0) return null;

        const allFeatureKeys = new Set<string>();
        const featureLabels = new Map<string, string>(); // normalizedKey -> display label

        const updateFeatureLabel = (normKey: string, label: string) => {
            const currentLabel = featureLabels.get(normKey);
            // Allow "Specification N" as a baseline if none exists
            if (!currentLabel) {
                featureLabels.set(normKey, label);
                return;
            }
            // Overwrite a generic "Specification N" with anything better
            if (currentLabel.startsWith('Specification ') && !label.startsWith('Specification ')) {
                featureLabels.set(normKey, label);
                return;
            }
            // Otherwise, prefer labels that have spaces or capital letters (unless current is already better)
            if (!label.startsWith('Specification ') && (label.includes(' ') || /[A-Z]/.test(label))) {
                featureLabels.set(normKey, label);
            }
        };

        // Map to store processed features for each product
        const productFeatures = new Map<string, Map<string, any>>();

        selectedProducts.forEach(product => {
            const features = new Map<string, any>();

            const addFeature = (normKey: string, label: string, value: any) => {
                if (!value || value === '-') return;

                const existing = features.get(normKey);
                if (existing !== undefined && existing !== null && typeof value === 'string' && typeof existing === 'string') {
                    // Avoid exact duplicates
                    if (!existing.includes(value)) {
                        features.set(normKey, `${existing}; ${value}`);
                    }
                } else {
                    features.set(normKey, value);
                }
                allFeatureKeys.add(normKey);
                updateFeatureLabel(normKey, label);
            };

            // 1. Standard Fields (Keep these keys stable)
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
                        addFeature(normalizeKey(key), key.charAt(0).toUpperCase() + key.slice(1), value);
                    }
                });
            }

            // 3. Category Specifications
            if (Array.isArray(product.category?.categorySpecification)) {
                product.category.categorySpecification.forEach(spec => {
                    addFeature(normalizeKey(spec.key), spec.label || spec.key, spec.value);
                });
            }

            // 4. Specification Table (Rich Specs)
            if (Array.isArray(product.specificationTable)) {
                product.specificationTable.forEach((table: any) => {
                    if (Array.isArray(table?.rows)) {
                        table.rows.forEach((row: any) => {
                            if (Array.isArray(row) && row.length >= 2) {
                                const [key, value] = row;
                                addFeature(normalizeKey(key), key, value);
                            }
                        });
                    }
                });
            }

            // 5. Legacy Features/Specs (Fallback)
            if (Array.isArray(product.features) && product.features.length > 0) {
                features.set('highlights', product.features);
                allFeatureKeys.add('highlights');
                featureLabels.set('highlights', 'Highlights');
            }

            // Process specifications with smart parsing and guessing
            if (Array.isArray(product.variants?.[0]?.specifications)) {
                product.variants[0].specifications.forEach((spec: any, idx) => {
                    const specValue = spec.value;
                    const specKey = spec.key;
                    if (!specValue) return;

                    // Option A: Use explicit key if provided by backend
                    if (specKey && specKey.length > 0 && specKey.length < 50) {
                        addFeature(normalizeKey(specKey), specKey, specValue);
                        return;
                    }

                    // Option B: Try to parse "Key: Value" or "Key - Value" or "Key\tValue"
                    const parts = specValue.split(/[:\t]\s*| \s*[-–—]\s+/);
                    if (parts.length >= 2) {
                        const key = parts[0].trim();
                        const val = parts.slice(1).join(': ').trim();
                        if (key.length > 0 && val.length > 0 && key.length < 50) {
                            addFeature(normalizeKey(key), key, val);
                            return;
                        }
                    }

                    // Option C: Try to guess label from value content
                    const guessedLabel = guessLabel(specValue);
                    if (guessedLabel) {
                        addFeature(normalizeKey(guessedLabel), guessedLabel, specValue);
                        return;
                    }

                    // Option D: Fallback to indexed spec
                    const compositeKey = `legacy_spec_${idx}`;
                    addFeature(compositeKey, `Specification ${idx + 1}`, specValue);
                });
            }

            productFeatures.set(product.id, features);
        });

        // Group Features: Common vs Uncommon
        const commonFeatures: string[] = [];
        const uncommonFeatures: string[] = [];

        allFeatureKeys.forEach(key => {
            // Skip standard keys that are handled separately in UI
            if (['price', 'mrp', 'rating', 'reviewCount', 'brand', 'category', 'description'].includes(key)) return;

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

        // Hierarchical Sort: 
        // 1. All "Specification N" last
        // 2. Alphabetical otherwise
        const sortFn = (a: string, b: string) => {
            const labelA = featureLabels.get(a) || a;
            const labelB = featureLabels.get(b) || b;
            const isSpecA = labelA.startsWith('Specification ');
            const isSpecB = labelB.startsWith('Specification ');
            if (isSpecA && !isSpecB) return 1;
            if (!isSpecA && isSpecB) return -1;
            return labelA.localeCompare(labelB);
        };

        commonFeatures.sort(sortFn);
        uncommonFeatures.sort(sortFn);

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
