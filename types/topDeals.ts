import { Prisma, ProductVariant } from "../app/generated/prisma";

export interface CategoryWithId {
  id: string;
}

export interface ProductIdWithSimilarity {
  id: string;
  similarity: number;
}

export interface VariantWithDeals extends ProductVariant {
  finalPrice: number;
  discountAmount: number;
  discountPercentage: number;
  specifications?: Array<{
    key: string;
    value: string;
  }>;
}

export interface ProductWithDetails {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string;
  variants: Array<{
    id: string;
    sku: string;
    price: Prisma.Decimal;
    mrp: Prisma.Decimal;
    stock: number;
    specifications: Array<{
      key: string;
      value: string;
    }>;
  }>;
  images: Array<{
    url: string;
    altText: string | null;
  }>;
  category: {
    id: string;
    name: string;
    slug: string;
    children: Array<{
      name: string;
    }>;
  } | null;
  productOffers: Array<{
    offer: {
      id: string;
      title: string;
      type: string;
      value: Prisma.Decimal;
    };
  }>;
  reviews: Array<{
    rating: number;
  }>;
}

export interface TopDealProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string;
  imageUrl: string | null;
  imageAltText: string | null;
  saveUpTo: number;
  discountPercentage: number;
  avgRating: number;
  category: {
    id: string;
    name: string;
    slug: string;
    children: Array<{
      name: string;
    }>;
  } | null;
  variants: VariantWithDeals[];
  productOffers: Array<{
    offer: {
      id: string;
      title: string;
      type: string;
      value: Prisma.Decimal;
    };
  }>;
  reviews: Array<{
    rating: number;
  }>;
  images: Array<{
    url: string;
    altText: string | null;
  }>;
}

export interface TopDealsArgs {
  topDealAbout: string;
  limit: number;
}
