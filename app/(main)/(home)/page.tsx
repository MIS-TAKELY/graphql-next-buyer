import { GET_PRODUCTS } from "@/client/product/product.queries";
import CompareButtonBar from "@/components/compare/CompareButtonBar";
import Main from "@/components/landingPage/Main";
import HeroCarousel from "@/components/page/home/HeroCarousel";
import ProductCatagoryCardSection from "@/components/page/home/ProductCatagoryCardSection";
import ProductSection from "@/components/page/home/ProductSection";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { SSRApolloProvider } from "@/lib/apollo/apollo-wrapper";
import { CacheService } from "@/services/CacheService";
import { TProduct } from "@/types/product";
import dynamic from "next/dynamic";

const DynamicSections = dynamic(
  () => import("@/components/page/home/DynamicSections")
);

import { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Home", // Will be "Home | Vanijoy"
  description:
    "Welcome to Vanijoy, your one-stop shop for the best products at unbeatable prices.",
  alternates: {
    canonical: "/",
  },
};

type SectionConfig = {
  name: string;
  products: TProduct[];
  count: number;
  layout: "grid" | "horizontal";
};

export default async function HomePage() {
  const client = await getServerApolloClient();

  const CACHE_KEY = CacheService.getProductsListKey();
  let products: TProduct[] =
    (await CacheService.get<TProduct[]>(CACHE_KEY)) || [];

  let debugError = "";

  if (products.length === 0) {
    try {
      const productsResponse = await client.query({
        query: GET_PRODUCTS,
        fetchPolicy: "no-cache",
        errorPolicy: "all",
      });
      products = productsResponse?.data?.getProducts || [];
      if (products.length > 0) {
        await CacheService.set(CACHE_KEY, products, 3600); // Cache for 1 hour
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);
      debugError = error.message || JSON.stringify(error);
      products = []; // Ensure products is empty array on error
    }
  }

  const sharedSlice = products.slice(0, 8);

  console.log("HomePage Debug: Products fetched:", products.length);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Vanijoy E-Commerce",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://Vanijoy-ecommerce.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${
          process.env.NEXT_PUBLIC_APP_URL || "https://Vanijoy-ecommerce.com"
        }/shop/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const sections: SectionConfig[] = [
    {
      name: "Today's Best Deals",
      products: sharedSlice,
      count: 8,
      layout: "horizontal",
    },
    {
      name: "Top Offers",
      products: sharedSlice,
      count: 8,
      layout: "horizontal",
    },
    {
      name: "Recommended For You",
      products: sharedSlice,
      count: 8,
      layout: "horizontal",
    },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductCatagoryCardSection />
      <HeroCarousel />
      <Main />
      <SSRApolloProvider initialData={{ products }}>
        <div className="py-4 sm:py-6 md:py-8 lg:py-10">
          {sections.map((section) => (
            <ProductSection
              key={section.name}
              name={section.name}
              products={section.products}
              count={section.count}
              layout={section.layout}
            />
          ))}
          <DynamicSections />
        </div>
      </SSRApolloProvider>

      {/* Comparison Button Bar - Floating */}
      <CompareButtonBar />
    </div>
  );
}
