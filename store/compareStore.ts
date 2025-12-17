import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CompareProduct } from "@/types/compare.types";

interface CompareStore {
    selectedProducts: CompareProduct[];
    addProduct: (product: CompareProduct) => boolean;
    removeProduct: (productId: string) => void;
    clearAll: () => void;
    isSelected: (productId: string) => boolean;
    getCount: () => number;
}

export const useCompareStore = create<CompareStore>()(
    persist(
        (set, get) => ({
            selectedProducts: [],

            addProduct: (product) => {
                const state = get();

                // Check if already selected
                if (state.isSelected(product.id)) {
                    return false;
                }

                // Check max limit (4 products)
                if (state.selectedProducts.length >= 4) {
                    return false;
                }

                set((state) => ({
                    selectedProducts: [...state.selectedProducts, product],
                }));
                return true;
            },

            removeProduct: (productId) => {
                set((state) => ({
                    selectedProducts: state.selectedProducts.filter(
                        (p) => p.id !== productId
                    ),
                }));
            },

            clearAll: () => {
                set({ selectedProducts: [] });
            },

            isSelected: (productId) => {
                return get().selectedProducts.some((p) => p.id === productId);
            },

            getCount: () => {
                return get().selectedProducts.length;
            },
        }),
        {
            name: "product-comparison",
        }
    )
);
