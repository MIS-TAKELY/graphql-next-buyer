import { GET_PRODUCT_BY_SLUG } from "@/client/product/product.queries";
import ProductPageClient from "@/components/page/product/ProductPageClient";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { SSRApolloProvider } from "@/lib/apollo/apollo-wrapper";
import { IProducts, TProduct } from "@/types/product";

export const revalidate = 3600;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // console.log("Slug being used:", slug); // Debug slug
  const client = await getServerApolloClient();

  let product: TProduct | null = null;
  let allProducts: IProducts[] = [];

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

  // console.log("final product-->", product);

  const initialCacheData = {
    products: allProducts,
    currentProduct: product,
  };

  // console.log("Final product:", product);

  return (
    <SSRApolloProvider initialData={initialCacheData}>
      <ProductPageClient product={product} />
    </SSRApolloProvider>
  );
}
