export interface Product {
  id: string;
  name: string;
  image: string;
  offerText?: string;
  priceRange?: string;
  additionalInfo?: string;
  reviewText?: string;
}

export interface Category {
  id: string;
  title: string;
  products: Product[];
}

export interface Subcategory {
  id: string;
  name: string;
  products: Product[];
}

export interface LargeCategory {
  id: string;
  title: string;
  subcategories: Subcategory[];
}
