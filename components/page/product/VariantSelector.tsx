// components/page/product/VariantSelector.tsx
"use client";

import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface VariantSelectorProps {
    variants: any[];
    selectedAttributes: Record<string, string>;
    onAttributeSelect: (key: string, value: string) => void;
}

export default function VariantSelector({
    variants,
    selectedAttributes,
    onAttributeSelect,
}: VariantSelectorProps) {
    // 1. Extract all available attributes from all variants
    const attributes = useMemo(() => {
        const attrs: Record<string, Set<string>> = {};

        variants.forEach((variant) => {
            if (variant.attributes) {
                Object.entries(variant.attributes).forEach(([key, value]) => {
                    if (!attrs[key]) {
                        attrs[key] = new Set();
                    }
                    // Ensure value is a string
                    if (typeof value === "string") {
                        attrs[key].add(value);
                    }
                });
            }
        });


        const dimensionFields = ["width", "height", "length", "weight", "isfragile"];
        const invalidValues = ["", "-", "0", "false", "null", "undefined"];

        return Object.entries(attrs)
            .filter(([key, values]) => {
                const lowerKey = key.toLowerCase();
                // If it's not a dimension field, keep it
                if (!dimensionFields.includes(lowerKey)) return true;

                // For dimension fields, check if there's at least one valid value in the set
                const hasValidValue = Array.from(values).some(val => {
                    const v = val.toString().trim().toLowerCase();
                    return !invalidValues.includes(v);
                });

                return hasValidValue;
            })
            .map(([key, values]) => ({
                key,
                values: Array.from(values).sort(), // Sort values for consistency,
            }));
    }, [variants]);

    if (attributes.length === 0) return null;

    return (
        <div className="space-y-4">
            {attributes.map(({ key, values }) => (
                <div key={key} className="space-y-2">
                    <span className="text-sm font-semibold text-foreground capitalize">
                        {key}: <span className="text-muted-foreground font-normal ml-1">{selectedAttributes[key]}</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {values.map((value) => {
                            const isSelected = selectedAttributes[key] === value;

                            // Check if this specific attribute combination is available in any variant
                            // This is a simplified check. For a robust solution, we might want to check 
                            // availability based on *other* selected attributes too.
                            // For now, we just check if this value exists in the gathered set (which it does).
                            // A more advanced check would be to see if selecting this would result in a valid variant
                            // given the OTHER current selections.

                            // Let's implement a basic "is available" check relative to CURRENT selections?
                            // Or keep it simple like amazon/flipkart where you select and it might switch others or show unavailable.
                            // For now, simpler: just render chips.

                            return (
                                <button
                                    key={value}
                                    onClick={() => onAttributeSelect(key, value)}
                                    className={cn(
                                        "px-4 py-2 text-sm font-medium rounded-md border transition-all duration-200",
                                        isSelected
                                            ? "border-primary bg-primary/5 text-primary shadow-sm"
                                            : "border-border text-foreground hover:border-primary/50 hover:bg-muted/50"
                                    )}
                                >
                                    {value}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
