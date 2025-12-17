export interface CompareProduct {
    id: string;
    name: string;
    slug: string;
    brand: string;
    description: string;
    category: {
        name: string;
    };
    variants: {
        price: number;
        mrp: number;
        specifications: {
            value: string;
        }[];
    }[];
    features?: string[];
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
