import {
  GET_PRODUCT_BY_SLUG,
  GET_PRODUCTS,
  GET_REMAINING_PRODUCT_BY_SLUG,
} from "@/client/product/product.queries";
import ProductPageClient from "@/components/page/product/ProductPageClient";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { SSRApolloProvider } from "@/lib/apollo/apollo-wrapper";
import {
  IProducts,
  IProductVarient,
  IRemainingProductDetails,
  TProduct,
} from "@/types/product";

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

  try {
    const productsResponse = await client.query({
      query: GET_PRODUCTS,
      fetchPolicy: "cache-first",
    });

    allProducts = productsResponse?.data?.getProducts || [];
    let productFromList: IProducts = allProducts.find(
      (p: any) => p.slug === slug
    ) ?? {
      id: "",
      name: "",
      description: "",
      slug: "",
      status: "",
      images: [],
      reviews: [],
      variants: [],
    };

    // console.log("Product from list-->", productFromList);

    const { data: remainingData, error } = await client.query({
      query: GET_REMAINING_PRODUCT_BY_SLUG,
      variables: { slug },
      fetchPolicy: "cache-first",
    });

    if (error) {
      console.error("Error fetching remaining product data:", error);
    }

    // console.log("Remaining data:", remainingData);
    const productFromRemaining: IRemainingProductDetails =
      remainingData?.getProductBySlug || {};
    if (productFromRemaining) {
      const mergedVariants: IProductVarient[] = productFromList.variants.map(
        (listVariant) => {
          const remainingVariant = productFromRemaining.variants?.find(
            (v) => v.id === listVariant.id
          );

          return {
            ...listVariant,
            stock: remainingVariant?.stock || "0",
            isDefault: remainingVariant?.isDefault || false,
            price: listVariant.price,
            id: listVariant.id,
          };
        }
      );

      product = {
        ...productFromList,
        ...productFromRemaining,
        variants: mergedVariants,
      } as TProduct; // explicit cast
    } else if (productFromList.id) {
      // Fallback when remaining details are missing
      product = {
        ...productFromList,
        category: { name: "" },
        seller: { firstName: "", lastName: "" },
        brand: { name: "" },
        warranty: "",
        specifications: "",
        features: "",
        variants: productFromList.variants.map((v) => ({
          ...v,
          stock: "0",
          isDefault: false,
        })),
      } as TProduct;
    }

    // console.log("Product found in all products:", product);
  } catch (error) {
    console.error("Error fetching all products:", error);
  }

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
