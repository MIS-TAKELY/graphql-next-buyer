// app/product/[slug]/page.tsx
import { GET_PRODUCT_BY_SLUG, GET_PRODUCTS } from "@/client/product/product.queries";
import ProductPageClient from "@/components/page/product/ProductPageClient";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { SSRApolloProvider } from "@/lib/apollo/apollo-wrapper";

// ISR configuration
export const revalidate = 3600;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await getServerApolloClient();

  let product;
  let allProducts = [];

  try {
    const productsResponse = await client.query({
      query: GET_PRODUCTS,
      fetchPolicy: "cache-first",
    });

    allProducts = productsResponse?.data?.getProducts || [];
    console.log("All products fetched:", allProducts.length);

    // Try to find the product in the fetched data
    product = allProducts.find((p: any) => p.slug === slug);
    console.log("Product found in all products:", !!product);
  } catch (error) {
    console.error("Error fetching all products:", error);
  }

  // If product not found in all products, fetch specifically by slug
  if (!product) {
    try {
      const { data, error } = await client.query({
        query: GET_PRODUCT_BY_SLUG,
        variables: { slug },
        fetchPolicy: "cache-first",
      });

      if (error) {
        console.error("Error fetching product by slug:", error);
        return <div>Error: {error.message}</div>;
      }

      if (!data?.getProductBySlug) {
        return <div>Product not found</div>;
      }

      product = data.getProductBySlug;
    } catch (error) {
      console.error("Error in product by slug query:", error);
      return <div>Error loading product</div>;
    }
  }

  // Prepare initial cache data for client
  const initialCacheData = {
    products: allProducts,
    currentProduct: product,
  };

  return (
    <SSRApolloProvider initialData={initialCacheData}>
      <ProductPageClient product={product} />
    </SSRApolloProvider>
  );
}
