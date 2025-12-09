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
      slug
      images {
        url
        altText
      }
      variants {
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
            // Filter out current product and random selection (mocking recommendation logic)
            const otherProducts = data.getProducts.filter(
                (p: any) => p.id !== currentProductId
            );
            // Randomize for "discovery" feel
            const shuffled = [...otherProducts].sort(() => 0.5 - Math.random());
            setProducts(shuffled.slice(0, 4));
        }
    }, [data, currentProductId]);

    if (loading || products.length === 0) return null;

    return (
        <div className="space-y-6 mt-12 border-t border-border pt-12">
            <h2 className="text-2xl font-bold">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
