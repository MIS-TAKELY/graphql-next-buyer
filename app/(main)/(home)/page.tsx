import { GET_PRODUCTS_MINIMAL } from "@/client/product/product.queries";
import HeroCarousel from "@/components/page/home/HeroCarousel";
import ProductCatagoryCardSection from "@/components/page/home/ProductCatagoryCardSection";
import ProductSection from "@/components/page/home/ProductSection";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { SSRApolloProvider } from "@/lib/apollo/apollo-wrapper";
import { CacheService } from "@/services/CacheService";
import { TProduct } from "@/types/product";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import MainContentLoader from "@/components/page/home/MainContentLoader";

const DynamicSections = dynamic(
  () => import("@/components/page/home/DynamicSections")
);

import {
  LandingPageProductGridSkeleton,
  PlainProductCardSkeleton,
} from "@/components/landingPage/LandingPageSkeletons";
import { ProductCardSkeleton } from "@/components/page/home/ProductCardSkeleton";

import { Metadata } from "next";

export const revalidate = 60; // Revalidate every minute instead of every hour

import { SEO_CONFIG, BUYER_KEYWORDS, SELLER_KEYWORDS, CONVENIENCE_KEYWORDS } from "@/config/seo";

export const metadata: Metadata = {
  title: "Vanijay – Smart Online Shopping with Fair Prices in Nepal",
  description: "Compare products, explore detailed specifications, and shop confidently. Vanijay offers a wide product range in Nepal with fair pricing, trusted sellers, and zero seller fees",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Vanijay – Smart Online Shopping with Fair Prices in Nepal",
    description: "Compare products, explore detailed specifications, and shop confidently. Vanijay offers a wide product range in Nepal with fair pricing, trusted sellers, and zero seller fees",
  }
};

type SectionConfig = {
  name: string;
  products: TProduct[];
  count: number;
  layout: "grid" | "horizontal";
};

import { GET_LANDING_PAGE_CATEGORY_CARDS } from "@/client/landing/landing-page-config.queries";
import { GET_LANDING_PAGE_BANNERS } from "@/client/landing/landing-page-banner.queries";

export default async function HomePage() {
  const client = await getServerApolloClient();

  let categoryCards = [];
  let banners = [];

  try {
    const [categoryCardsData, bannersData] = await Promise.all([
      client.query({ query: GET_LANDING_PAGE_CATEGORY_CARDS }),
      client.query({ query: GET_LANDING_PAGE_BANNERS }),
    ]);

    categoryCards = categoryCardsData.data?.getLandingPageCategoryCards || [];
    banners = bannersData.data?.getLandingPageBanners || [];
  } catch (error) {
    console.error("Error fetching landing page configuration:", error);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Vanijay E-Commerce",
    url: "https://www.vanijay.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `https://www.vanijay.com/shop/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductCatagoryCardSection categories={categoryCards} />
      <HeroCarousel banners={banners} />

      <Suspense fallback={<MainSkeleton />}>
        <MainContentLoader />
      </Suspense>
      <Suspense fallback={<ProductSectionsSkeleton />}>
        <HomeProductSections />
      </Suspense>
      {/* Comparison Button Bar - Floating - Moved to global layout */}
      {/* <CompareFloater /> */}
    </div>
  );
}

import { GET_TOP_DEALS } from "@/client/landing/topdeals.query";

async function HomeProductSections() {
  const client = await getServerApolloClient();

  // 1. Fetch Today's Best Deals (Targeting Electronics)
  // 2. Fetch Top Offers (General Trending/Top Picks)
  // 3. Keep generic products for Provider if needed by other components

  let bestDeals: TProduct[] = [];
  let topOffers: TProduct[] = [];
  let genericProducts: TProduct[] = [];

  try {
    const [bestDealsRes, topOffersRes, genericRes] = await Promise.all([
      client.query({
        query: GET_TOP_DEALS,
        variables: { topDealAbout: "Electronics", limit: 8 },
        fetchPolicy: "no-cache"
      }),
      client.query({
        query: GET_TOP_DEALS,
        variables: { topDealAbout: "Trending Deals", limit: 8 },
        fetchPolicy: "no-cache"
      }),
      client.query({
        query: GET_PRODUCTS_MINIMAL,
        variables: { limit: 24 },
        fetchPolicy: "no-cache"
      })
    ]);

    bestDeals = bestDealsRes.data?.getTopDealSaveUpTo || [];
    topOffers = topOffersRes.data?.getTopDealSaveUpTo || [];
    genericProducts = genericRes.data?.getProducts || [];
  } catch (error) {
    console.error("Error fetching landing page product sections:", error);
  }

  const serializableProducts = JSON.parse(JSON.stringify(genericProducts));

  const sections: SectionConfig[] = [
    {
      name: "Today's Best Deals",
      products: bestDeals.length > 0 ? bestDeals : serializableProducts.slice(0, 8),
      count: 8,
      layout: "horizontal",
    },
    {
      name: "Top Offers",
      products: topOffers.length > 0 ? topOffers : serializableProducts.slice(8, 16),
      count: 8,
      layout: "horizontal",
    },
  ];

  return (
    <SSRApolloProvider initialData={{ products: serializableProducts }}>
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
  );
}

function MainSkeleton() {
  return (
    <main className="bg-background pt-2 sm:pt-4 pb-4 sm:pb-8">
      <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-12">
        {[...Array(3)].map((_, sectionIndex) => (
          <section key={sectionIndex} className="container-custom">
            <div className="flex justify-between items-center mb-6">
              <div className="h-7 w-64 bg-secondary/20 rounded animate-pulse" />
            </div>
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {[...Array(8)].map((_, i) => (
                <PlainProductCardSkeleton key={i} />
              ))}
            </div>
          </section>
        ))}
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, gridIndex) => (
              <LandingPageProductGridSkeleton key={gridIndex} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function ProductSectionsSkeleton() {
  return (
    <div className="py-4 sm:py-6 md:py-8 lg:py-10">
      {[
        { name: "Today's Best Deals", count: 8 },
        { name: "Top Offers", count: 6 },
        { name: "Recommended For You", count: 12 },
      ].map((section, idx) => (
        <section key={idx} className="mb-8 xs:mb-10 sm:mb-12 md:mb-16">
          <div className="container-custom">
            <div className="h-8 w-64 bg-secondary/20 rounded animate-pulse mb-4 sm:mb-6 px-1" />
            <div
              className={
                idx === 0
                  ? "flex gap-3 xs:gap-4 sm:gap-5 md:gap-6 overflow-x-auto pb-4 sm:pb-6 horizontal-scroll scrollbar-hide"
                  : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6"
              }
            >
              {[...Array(section.count)].map((_, i) => (
                <div key={i} className={idx === 0 ? "flex-none w-[220px]" : ""}>
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
