import { GET_PRODUCT_BY_SLUG } from "@/client/product/product.queries";
import ProductPageClient from "@/components/page/product/ProductPageClient";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { SSRApolloProvider } from "@/lib/apollo/apollo-wrapper";
import { CacheService } from "@/services/CacheService";
import { TProduct } from "@/types/product";
import { Metadata, ResolvingMetadata } from "next";

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getProduct(slug: string) {
  const CACHE_KEY = CacheService.getProductDetailKey(slug);
  let product: TProduct | null = await CacheService.get<TProduct>(CACHE_KEY);

  if (product) return product;

  const client = await getServerApolloClient();
  try {
    const { data } = await client.query({
      query: GET_PRODUCT_BY_SLUG,
      variables: { slug },
      fetchPolicy: "no-cache",
    });
    product = data?.getProductBySlug as TProduct | null;

    if (product) {
      await CacheService.set(CACHE_KEY, product, 3600);
    }

    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const productImage = product.images?.[0]?.url;

  return {
    title: product.name,
    description:
      product.description?.substring(0, 160) ||
      `Buy ${product.name} at the best price.`,
    alternates: {
      canonical: `/shop/product/${slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.description?.substring(0, 160),
      images: productImage ? [productImage, ...previousImages] : previousImages,
      url: `/shop/product/${slug}`,
      type: "website", // Fallback to website for better type compatibility, or use 'article'
      // properties like price are not standard OG, usually handled by Schema.org
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description?.substring(0, 160),
      images: productImage ? [productImage] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await getServerApolloClient();

  let product: TProduct | null = null;
  const CACHE_KEY = CacheService.getProductDetailKey(slug);

  product = await CacheService.get<TProduct>(CACHE_KEY);

  console.log("product frmo sache-->", product);

  if (!product) {
    console.log("calling bds");
    try {
      const { data, error, errors } = await client.query({
        query: GET_PRODUCT_BY_SLUG,
        variables: { slug },
        fetchPolicy: "no-cache", // fetch fresh if no redis cache
      });

      console.log("GraphQL Response:", { data, error, errors });

      if (error) {
        console.log("error-->", error);
        console.error("Error fetching product by slug:", error);
        return <div>Error: {error.message}</div>;
      }

      if (errors && errors.length > 0) {
        console.error("GraphQL errors:", errors);
        return <div>GraphQL Error: {errors[0].message}</div>;
      }

      product = data?.getProductBySlug;
      console.log("product frmo db-->", product);
    } catch (err: any) {
      console.error("Caught exception during GraphQL query:", err);
      // Log more details if it's a network error
      if (err.networkError) {
        console.error("Network error details:", err.networkError);
      }
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
          <div className="p-6 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30 max-w-2xl w-full">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
              {err.name === "ApolloError" ? "Fetch Failed" : "Something went wrong"}
            </h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              We encountered an issue while loading this product. This is often a temporary network issue.
            </p>
            {process.env.NODE_ENV !== "production" && (
              <pre className="mt-4 p-4 bg-white dark:bg-black/40 rounded border border-red-100 dark:border-red-900/30 overflow-auto text-left text-xs text-red-500 font-mono">
                {err.message}
                {"\n\n"}
                {JSON.stringify(err, null, 2)}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (product) {
      await CacheService.set(CACHE_KEY, product, 3600);
    }
  }

  // Handle case where product is still null (from DB and no error)
  if (!product) {
    return <div>Product not found</div>;
  }

  const initialCacheData = {
    currentProduct: product,
  };

  const currentPrice = product.variants?.[0]?.price
    ? Number(product.variants[0].price)
    : 0;
  // Ensure stock is treated as a number
  const stockValue = product.variants?.[0]?.stock;
  const stock = stockValue ? Number(stockValue) : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images?.map((img) => img.url) || [],
    description: product.description,
    sku: product.variants?.[0]?.sku || "",
    brand: {
      "@type": "Brand",
      name:
        typeof product.brand === "string"
          ? product.brand
          : product.brand?.name || "Generic",
    },
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_APP_URL || "https://vanijay.com"
        }/shop/product/${slug}`,
      priceCurrency: "NPR",
      price: currentPrice,
      itemCondition: "https://schema.org/NewCondition",
      availability:
        stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item:
          process.env.NEXT_PUBLIC_APP_URL || "https://vanijay.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: product.category?.name || "Shop",
        item: `${process.env.NEXT_PUBLIC_APP_URL || "https://vanijay.com"
          }/shop`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${process.env.NEXT_PUBLIC_APP_URL || "https://vanijay.com"
          }/shop/product/${slug}`,
      },
    ],
  };

  return (
    <SSRApolloProvider initialData={initialCacheData}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ProductPageClient product={product} />
    </SSRApolloProvider>
  );
}
