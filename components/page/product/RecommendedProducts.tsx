// components/page/product/RecommendedProducts.tsx
"use client";

import ProductSection from "@/components/page/home/ProductSection";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";


import { GET_FREQUENTLY_BOUGHT_TOGETHER, GET_RECOMMENDED_PRODUCTS } from "@/client/product/product.queries";


interface RecommendedProductsProps {
  currentProductId: string;
  title?: string;
}

export default function RecommendedProducts({
  currentProductId,
  title = "You Might Also Like",
}: RecommendedProductsProps) {
  const isFrequentlyBought = title === "Frequently Bought Together";
  const QUERY = isFrequentlyBought ? GET_FREQUENTLY_BOUGHT_TOGETHER : GET_RECOMMENDED_PRODUCTS;

  const { data, loading } = useQuery(QUERY, {
    variables: { productId: currentProductId },
  });

  if (loading) return null; // Or a skeleton

  const products = isFrequentlyBought
    ? (data?.getFrequentlyBoughtTogether || [])
    : (data?.getRecommendedProducts || []);

  if (products.length === 0) return null;

  return (
    <ProductSection
      name={title}
      products={products}
      count={10}
      layout="horizontal"
    />
  );
}
