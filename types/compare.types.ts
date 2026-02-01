export interface CompareProduct {
    id: string;
    name: string;
    slug: string;
    brand: string | { name: string };
    description: string;
    category: {
        name: string;
        categorySpecification?: {
            key: string;
            label: string;
            value?: string;
        }[];
    };
    variants: {
        price: number;
        mrp: number;
        specifications: {
            value: string;
        }[];
        attributes?: Record<string, string>;
    }[];
    features?: string[];
    specificationTable?: {
        rows: string[][]; // [key, value]
    }[];
    images: {
        altText: string;
        url: string;
    }[];
    reviews: {
        rating: number;
    }[];
}

export interface CompareFeature {
    label: string;
    key: string;
    values: (string | number | null)[];
    type: 'text' | 'price' | 'rating' | 'number';
    highlightBest?: boolean;
}
