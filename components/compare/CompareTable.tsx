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

const canonicalKeys: Record<string, string> = {
    'ssd': 'storage',
    'hdd': 'storage',
    'harddrive': 'storage',
    'harddisk': 'storage',
    'rom': 'storage',
    'storagetype': 'storage',
    'ram': 'memory',
    'processor': 'cpu',
    'chipset': 'cpu',
    'graphics': 'gpu',
    'videocard': 'gpu',
    'display': 'screen',
    'panel': 'screen',
    'resolution': 'screen',
    'displaydetails': 'screen',
    'colorsupport': 'display_color',
    'colordepth': 'display_color',
    'colorgamut': 'display_color',
    'contrastratio': 'contrast',
    'staticcontrast': 'contrast',
    'dynamiccontrastratio': 'contrast',
    'battery': 'power',
    'capacity': 'power',
    'batteryandpower': 'power',
    'os': 'operating system',
    'softwareandos': 'operating system',
    'imageformats': 'formats',
    'videoformats': 'formats',
    'audioformats': 'formats',
    'macro': 'camera_features',
    'autofocus': 'camera_features',
    'ois': 'camera_features',
    'brightness': 'brightness',
    'brightnesshbm': 'brightness',
    'peakbrightness': 'brightness',
    'peak': 'brightness',
    'refreshrate': 'refresh_rate',
    'displaysize': 'screen_size',
    'screensize': 'screen_size',
    'size': 'screen_size',
    'ize': 'screen_size',
    'storage': 'storage',
    'storageoptions': 'storage',
    'storagespace': 'storage',
    'internalstorage': 'storage',
    'variant': 'variants',
    'variants': 'variants',
    'model': 'model',
    'modelname': 'model',
    'color': 'color',
    'colors': 'color',
    'finish': 'color',
    'case': 'box_contents',
    'inclusion': 'box_contents',
};

const normalizeKey = (key: string, smartMapping?: Record<string, string>) => {
    const normalized = key.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim();

    // 1. Check static overrides
    if (canonicalKeys[normalized]) return canonicalKeys[normalized];

    // 2. Check dynamic smart mapping from LLM
    if (smartMapping && smartMapping[normalized]) return smartMapping[normalized];

    return normalized;
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

const canonicalLabels: Record<string, string> = {
    'storage': 'Storage',
    'memory': 'Memory',
    'cpu': 'Processor',
    'gpu': 'Graphics',
    'screen': 'Display',
    'display_color': 'Display Color',
    'contrast': 'Contrast',
    'brightness': 'Brightness',
    'refresh_rate': 'Refresh Rate',
    'screen_size': 'Display Size',
    'power': 'Battery',
    'operating system': 'OS',
    'formats': 'Supported Formats',
    'camera_features': 'Camera Features',
    'box_contents': 'In the Box',
    'variants': 'Variants',
    'color': 'Color',
    'model': 'Model',
};

interface CompareTableProps {
    smartMapping?: Record<string, string>;
}

export default function CompareTable({ smartMapping }: CompareTableProps) {
    const { selectedProducts, removeProduct } = useCompareStore();

    // Flatten all product data into a unified structure for comparison
    const preparedData = useMemo(() => {
        if (selectedProducts.length === 0) return null;

        const allFeatureKeys = new Set<string>();
        const featureLabels = new Map<string, string>(); // normalizedKey -> display label

        const updateFeatureLabel = (normKey: string, label: string) => {
            // Priority 1: Canonical labels for unified keys
            if (canonicalLabels[normKey]) {
                featureLabels.set(normKey, canonicalLabels[normKey]);
                return;
            }

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
                    // Avoid exact duplicates or redundant substrings during merge
                    const cleanVal = value.trim();
                    const cleanExisting = existing.trim();

                    if (cleanExisting === cleanVal) return;

                    const existingParts = cleanExisting.split(/;\s+/);
                    if (!existingParts.includes(cleanVal)) {
                        features.set(normKey, `${cleanExisting}; ${cleanVal}`);
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
                        addFeature(normalizeKey(key, smartMapping), key.charAt(0).toUpperCase() + key.slice(1), value);
                    }
                });
            }


            // 4. Specification Table (Rich Specs)
            // Handle both Array and Stringified JSON or complex nested structures
            let tableData = product.specificationTable;
            if (tableData && typeof tableData === 'string') {
                try {
                    tableData = JSON.parse(tableData);
                } catch (e) {
                    console.error("Failed to parse specificationTable:", e);
                }
            }

            const processRows = (rows: any[]) => {
                if (!Array.isArray(rows)) return;
                rows.forEach((row: any) => {
                    if (Array.isArray(row) && row.length >= 2) {
                        const [key, value] = row;
                        const specValue = typeof value === 'object' ? JSON.stringify(value) : value;
                        addFeature(normalizeKey(key, smartMapping), key, specValue);
                    } else if (typeof row === 'object' && row !== null && 'key' in row && 'value' in row) {
                        addFeature(normalizeKey(row.key, smartMapping), row.key, row.value);
                    }
                });
            };

            if (Array.isArray(tableData)) {
                (tableData as any[]).forEach((item: any) => {
                    if (!item) return;

                    // 1. New Multi-Section format: { title, headers, rows }
                    if (Array.isArray(item.rows)) {
                        processRows(item.rows);
                    }
                    // 2. Format with sections array: { sections: [{ rows }] }
                    else if (item.sections && Array.isArray(item.sections)) {
                        (item.sections as any[]).forEach((sec: any) => processRows(sec.rows));
                    }
                    // 3. Flat array of [key, value] pairs: [[key, value], ...]
                    else if (Array.isArray(item) && item.length >= 2 && typeof item[0] === 'string') {
                        addFeature(normalizeKey(item[0], smartMapping), item[0], item[1]);
                    }
                    // 4. Flat array of {key, value} objects: [{key, value}, ...]
                    else if (typeof item === 'object' && 'key' in item && 'value' in item) {
                        addFeature(normalizeKey(item.key, smartMapping), item.key, item.value);
                    }
                });
            } else if (tableData && typeof tableData === 'object') {
                const td = tableData as any;
                // Double check if it's the {headers, rows} format
                if (Array.isArray(td.rows)) {
                    processRows(td.rows);
                } else if (Array.isArray(td.sections)) {
                    (td.sections as any[]).forEach((sec: any) => processRows(sec.rows));
                } else {
                    // Simple Object format: { Key: Value }
                    Object.entries(td).forEach(([key, value]) => {
                        if (typeof value !== 'function') {
                            addFeature(normalizeKey(key, smartMapping), key, value);
                        }
                    });
                }
            }

            // 5. Features / Highlights
            if (Array.isArray(product.features) && product.features.length > 0) {
                // Filter out empty strings
                const cleanFeatures = product.features.filter(f => f && f.trim());
                if (cleanFeatures.length > 0) {
                    features.set('highlights', cleanFeatures);
                    allFeatureKeys.add('highlights');
                    featureLabels.set('highlights', 'Highlights');
                }
            }

            // 6. Detailed Specifications Array
            if (Array.isArray(product.variants?.[0]?.specifications)) {
                product.variants[0].specifications.forEach((spec: any, idx) => {
                    const specValue = spec.value;
                    const specKey = spec.key;
                    if (!specValue) return;

                    // Option A: Use explicit key if provided
                    if (specKey && specKey.length > 0 && specKey.length < 50) {
                        addFeature(normalizeKey(specKey, smartMapping), specKey, specValue);
                        return;
                    }

                    // Option B: Try to parse "Key: Value"
                    const parts = specValue.split(/[:\t]\s*| \s*[-–—]\s+/);
                    if (parts.length >= 2) {
                        const key = parts[0].trim();
                        const val = parts.slice(1).join(': ').trim();
                        if (key.length > 0 && val.length > 0 && key.length < 50) {
                            addFeature(normalizeKey(key, smartMapping), key, val);
                            return;
                        }
                    }

                    // Option C: Guess label
                    const guessedLabel = guessLabel(specValue);
                    if (guessedLabel) {
                        addFeature(normalizeKey(guessedLabel, smartMapping), guessedLabel, specValue);
                        return;
                    }

                    // Option D: Fallback
                    const compositeKey = `legacy_spec_${idx}`;
                    addFeature(compositeKey, `Specification ${idx + 1}`, specValue);
                });
            }

            productFeatures.set(product.id, features);
        });

        // Group Features: Common vs Uncommon
        const commonFeatures: string[] = [];
        const uncommonFeatures: string[] = [];

        // Identify all keys that should be compared as features
        allFeatureKeys.forEach(key => {
            // Skip standard fields handled in header
            if (['price', 'mrp', 'rating', 'reviewCount', 'brand', 'category', 'description'].includes(key)) return;

            // Check if every selected product has a valid value for this feature
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

        // Hierarchical Sort
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

    }, [selectedProducts, smartMapping]);

    const [showAllSpecs, setShowAllSpecs] = React.useState(false);

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

    const visibleUncommonFeatures = showAllSpecs ? uncommonFeatures : uncommonFeatures.slice(0, 10);

    return (
        <>
            {/* Desktop: Side-by-side table */}
            <div className="hidden md:block overflow-x-auto">
                <div className="min-w-full inline-block align-middle">
                    <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${selectedProducts.length}, 1fr)` }}>
                        {/* ... (Header, Core Info, etc.) ... */}
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
                                <div className="col-span-full py-4 mt-6 mb-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    Common Specifications
                                </div>
                                {commonFeatures.map(key => renderFeatureRow(key))}
                            </>
                        )}

                        {/* 4. Section Divider: Other Features */}
                        {uncommonFeatures.length > 0 && (
                            <>
                                <div className="col-span-full py-4 mt-8 mb-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 font-semibold text-gray-900 dark:text-white flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                        Product Specific Differences
                                    </div>
                                    {uncommonFeatures.length > 10 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowAllSpecs(!showAllSpecs)}
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700"
                                        >
                                            {showAllSpecs ? "Show Less" : `Show All (${uncommonFeatures.length})`}
                                        </Button>
                                    )}
                                </div>
                                {visibleUncommonFeatures.map(key => renderFeatureRow(key))}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile View - Stacked Cards */}
            <div className="md:hidden space-y-6">
                {selectedProducts.map(product => (
                    <Card key={product.id} className="relative">
                        <Button onClick={() => handleRemove(product.id)} variant="ghost" className="absolute top-2 right-2 p-1 h-auto"><X className="w-4 h-4" /></Button>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex gap-4">
                                <div className="relative w-24 h-24 bg-gray-50 rounded shrink-0">
                                    <Image src={product.images[0]?.url || "/placeholder.svg"} alt={product.name} fill className="object-contain p-1" unoptimized />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm line-clamp-2">{product.name}</h3>
                                    <div className="mt-2 font-bold text-lg">{formatPrice(productFeatures.get(product.id)?.get('price'))}</div>
                                </div>
                            </div>

                            <div className="border-t pt-2 space-y-2">
                                {[...commonFeatures, ...uncommonFeatures].slice(0, showAllSpecs ? 100 : 8).map(key => {
                                    const val = productFeatures.get(product.id)?.get(key);
                                    if (!val || val === '-') return null;
                                    return (
                                        <div key={key} className="flex justify-between text-sm">
                                            <span className="text-gray-500">{featureLabels.get(key) || key}</span>
                                            <span className="font-medium text-right max-w-[60%]">{Array.isArray(val) ? val.length + " items" : val}</span>
                                        </div>
                                    )
                                })}
                                {(commonFeatures.length + uncommonFeatures.length) > 8 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-2"
                                        onClick={() => setShowAllSpecs(!showAllSpecs)}
                                    >
                                        {showAllSpecs ? "Show Less" : "Show All Specifications"}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
