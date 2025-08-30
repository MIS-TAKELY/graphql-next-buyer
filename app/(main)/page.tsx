import { GET_PRODUCTS } from "@/client/product/product.queries";
import ClientCartProvider from "@/components/page/home/ClientCartProvider";
import HeroCarousel from "@/components/page/home/HeroCarousel";
import { IProduct } from "@/components/page/home/ProductCard";
import ProductCatagoryCardSection from "@/components/page/home/ProductCatagoryCardSection";
import ProductSection from "@/components/page/home/ProductSection";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { Suspense } from "react";

// ISG: Revalidate every hour
export const revalidate = 3600;

export default async function HomePage() {
  const client = await getServerApolloClient();
  // Fetch products server-side with Prisma
  const productsResponse = await client.query({
    query: GET_PRODUCTS,
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  });
  console.log(productsResponse)
  const products=productsResponse?.data?.getProducts
  console.log(products)

  // Split products for sections (same logic as your memoized productSections)
  const productSections = {
    bestDeals: products?.slice(0, 8),
    topOffers: products?.slice(0, 8),
    recommended: products?.slice(0, 8),
  };

  return (
    <ClientCartProvider>
      <div className="bg-gray-50">
        <ProductCatagoryCardSection />
        <HeroCarousel />
        <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 lg:py-8">
          <Suspense fallback={<div>Loading best deals...</div>}>
            <ProductSection
              name="Today's Best Deals"
              products={productSections.bestDeals as IProduct[]}
              count={8}
              layout="horizontal"
            />
          </Suspense>
          <Suspense fallback={<div>Loading top offers...</div>}>
            <ProductSection
              name="Top Offers"
              products={productSections.bestDeals as IProduct[]}
              count={6}
              layout="grid"
            />
          </Suspense>
          <Suspense fallback={<div>Loading recommended...</div>}>
            <ProductSection
              name="Recommended For You"
              products={productSections.bestDeals as IProduct[]}
              count={6}
              layout="grid"
            />
          </Suspense>
        </div>
      </div>
    </ClientCartProvider>
  );
}
