import { create } from "zustand";

interface ProductFilters {
    priceRange: [number, number];
    categories: string[];
    sort: string;
    searchQuery: string;
    dynamicFilters: { [key: string]: string[] };
    minRating: number;
}

interface ProductStore {
    filters: ProductFilters;
    setFilters: (filters: Partial<ProductFilters>) => void;
    resetFilters: () => void;

    // Can expand to cache product lists if needed
    // products: Product[];
    // setProducts: (products: Product[]) => void;

    // Specific actions for better DX
    toggleDynamicFilter: (key: string, value: string) => void;
    setPriceRange: (range: [number, number]) => void;
    setMinRating: (rating: number) => void;
}

const initialFilters: ProductFilters = {
    priceRange: [0, 100000], // Updated default range to match UI
    categories: [],
    sort: "relevance", // Updated default sort
    searchQuery: "",
    dynamicFilters: {},
    minRating: 0,
};

export const useProductStore = create<ProductStore>((set) => ({
    filters: initialFilters,

    setFilters: (updates) =>
        set((state) => ({
            filters: { ...state.filters, ...updates },
        })),

    resetFilters: () => set({ filters: initialFilters }),

    toggleDynamicFilter: (key, value) => set((state) => {
        const currentValues = state.filters.dynamicFilters[key] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter((v) => v !== value)
            : [...currentValues, value];

        return {
            filters: {
                ...state.filters,
                dynamicFilters: {
                    ...state.filters.dynamicFilters,
                    [key]: newValues,
                },
            },
        };
    }),

    setPriceRange: (range) => set((state) => ({
        filters: { ...state.filters, priceRange: range }
    })),

    setMinRating: (rating) => set((state) => ({
        filters: { ...state.filters, minRating: rating }
    })),
}));
