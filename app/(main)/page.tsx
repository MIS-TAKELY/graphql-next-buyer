import { GET_PRODUCTS } from "@/client/product/product.queries";
import Main from "@/components/landingPage/Main";
import HeroCarousel from "@/components/page/home/HeroCarousel";
import ProductCatagoryCardSection from "@/components/page/home/ProductCatagoryCardSection";
import ProductSection from "@/components/page/home/ProductSection";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { SSRApolloProvider } from "@/lib/apollo/apollo-wrapper";
import { IProducts } from "@/types/product";

export const revalidate = 3600;

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

  const sections: SectionConfig[] = [
    { name: "Today's Best Deals", products: sharedSlice, count: 8, layout: "horizontal" },
    { name: "Top Offers", products: sharedSlice, count: 6, layout: "grid" },
    { name: "Recommended For You", products: sharedSlice, count: 6, layout: "grid" },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen">
      <ProductCatagoryCardSection />
      <HeroCarousel />
      <Main />
      <div className="ultra-wide-container py-4 sm:py-6 md:py-8 lg:py-10">
        <SSRApolloProvider initialData={{ products }}>
          {sections.map((section) => (
            <ProductSection
              key={section.name}
              name={section.name}
              products={section.products}
              count={section.count}
              layout={section.layout}
            />
          ))}
        </SSRApolloProvider>
      </div>
    </div>
  );
}
