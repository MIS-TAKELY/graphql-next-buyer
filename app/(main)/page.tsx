import { GET_PRODUCTS } from "@/client/product/product.queries";
import HeroCarousel from "@/components/page/home/HeroCarousel";
import ProductCatagoryCardSection from "@/components/page/home/ProductCatagoryCardSection";
import ProductSection from "@/components/page/home/ProductSection";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { SSRApolloProvider } from "@/lib/apollo/apollo-wrapper";
import { IProducts } from "@/types/product";

export const revalidate = 3600;

// Define section config for scalability
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
  // console.log(productsResponse);
  const products = productsResponse?.data?.getProducts || [];
  // console.log(products);

  // Compute slices once for optimization
  const sharedSlice = products.slice(0, 8); // Reuse for sections with same data

  // Config array: Easy to add/remove sections
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
      count: 6,
      layout: "grid",
    },
    {
      name: "Recommended For You",
      products: sharedSlice,
      count: 6,
      layout: "grid",
    },
  ];

  return (
    <div className="bg-gray-50">
      <ProductCatagoryCardSection />
      <HeroCarousel />
      <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 lg:py-8">
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
