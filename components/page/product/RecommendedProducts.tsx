// components/page/product/RecommendedProducts.tsx
"use client";

import ProductSection from "@/components/page/home/ProductSection";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";


// AI-powered recommendations using vector similarity
const GET_RECOMMENDED_PRODUCTS = gql`
  query GetRecommendedProducts($productId: ID!) {
    getRecommendedProducts(productId: $productId) {
      id
      name
      description
      brand
      slug
      images {
        url
        altText
      }
      reviews {
        rating
      }
      variants {
        price
        mrp
        sku
        stock
        specifications {
          key
          value
        }
      }
    }
  }
`;

interface RecommendedProductsProps {
  currentProductId: string;
  title?: string;
}

export default function RecommendedProducts({
  currentProductId,
  title = "You Might Also Like",
}: RecommendedProductsProps) {
  const { data, loading } = useQuery(GET_RECOMMENDED_PRODUCTS, {
    variables: { productId: currentProductId },
    skip: !currentProductId,
  });

  if (loading) return null; // Or a skeleton

  const products = data?.getRecommendedProducts || [];

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
