import { GET_PRODUCTS } from "@/client/product/product.queries";
import Main from "@/components/landingPage/Main";
import HeroCarousel from "@/components/page/home/HeroCarousel";
import ProductCatagoryCardSection from "@/components/page/home/ProductCatagoryCardSection";
import ProductSection from "@/components/page/home/ProductSection";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { SSRApolloProvider } from "@/lib/apollo/apollo-wrapper";
import { IProducts } from "@/types/product";
import dynamic from "next/dynamic";

const DynamicSections = dynamic(() => import("@/components/page/home/DynamicSections"));

import { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Home", // Will be "Home | Vanijoy"
  description: "Welcome to Vanijoy, your one-stop shop for the best products at unbeatable prices.",
  alternates: {
    canonical: "/",
  },
};

type SectionConfig = {
  name: string;
  products: IProducts[];
  count: number;
  layout: "grid" | "horizontal";
};

export default async function HomePage() {
  const client = await getServerApolloClient();

  const productsResponse = await client.query({
    query: GET_PRODUCTS,
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  });

  const products = productsResponse?.data?.getProducts || [];
  const sharedSlice = products.slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Vanijoy E-Commerce",
    "url": process.env.NEXT_PUBLIC_APP_URL || "https://Vanijoy-ecommerce.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${process.env.NEXT_PUBLIC_APP_URL || "https://Vanijoy-ecommerce.com"}/shop/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const sections: SectionConfig[] = [
    { name: "Today's Best Deals", products: sharedSlice, count: 8, layout: "horizontal" },
    { name: "Top Offers", products: sharedSlice, count: 6, layout: "grid" },
    { name: "Recommended For You", products: sharedSlice, count: 6, layout: "grid" },
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
    </div>
  );
}
