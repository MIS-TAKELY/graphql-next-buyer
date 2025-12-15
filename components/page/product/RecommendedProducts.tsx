// components/page/product/RecommendedProducts.tsx
"use client";

import ProductCard from "@/components/page/home/ProductCard";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { useEffect, useState } from "react";

// Using a generic query for products. In a real scenario, this would filter by category or tags.
const GET_RECOMMENDED_PRODUCTS = gql`
  query GetRecommendedProducts {
    getProducts {
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
  const { data, loading } = useQuery(GET_RECOMMENDED_PRODUCTS);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (data?.getProducts) {
      // Filter out current product
      let otherProducts = data.getProducts.filter(
        (p: any) => p.id !== currentProductId
      );

      // Fallback for development/demo: if no other products, show current product or all
      if (otherProducts.length === 0 && data.getProducts.length > 0) {
        otherProducts = data.getProducts;
      }

      // Randomize for "discovery" feel
      const shuffled = [...otherProducts].sort(() => 0.5 - Math.random());
      setProducts(shuffled.slice(0, 10));
    }
  }, [data, currentProductId]);

  if (loading) return null;
  // If no products at all (even after fallback), hide section
  if (products.length === 0) return null;

  return (
    <div className="space-y-6 mt-8 border-t border-border pt-8">
      <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
      <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {products.map((product) => (
          <div key={product.id} className="min-w-[160px] sm:min-w-[220px] flex-shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
