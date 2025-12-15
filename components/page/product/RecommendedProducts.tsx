// components/page/product/RecommendedProducts.tsx
"use client";

import ProductCard from "@/components/page/home/ProductCard";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";


// AI-powered recommendations using vector similarity
const GET_RECOMMENDED_PRODUCTS = gql`
  query GetRecommendedProducts($productId: ID!, $limit: Int) {
    getRecommendedProducts(productId: $productId, limit: $limit) {
      id
      name
      description
      slug
      images {
        url
        altText
      }
      variants {
        id
        price
        mrp
      }
      reviews {
        rating
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
    variables: {
      productId: currentProductId,
      limit: 10,
    },
    skip: !currentProductId,
  });

  const products = data?.getRecommendedProducts || [];

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <div className="space-y-6 mt-8 border-t border-border pt-8">
      <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>

      <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {products.map((product: any) => (
          <div key={product.id} className="min-w-[160px] sm:min-w-[220px] flex-shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
