import { GET_PRODUCT_BY_SLUG } from "@/client/product/product.queries";
import ProductPageClient from "@/components/page/product/ProductPageClient";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { SSRApolloProvider } from "@/lib/apollo/apollo-wrapper";
import { CacheService } from "@/services/CacheService";
import { TProduct } from "@/types/product";
import { Metadata, ResolvingMetadata } from "next";

export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getProduct(slug: string) {
  const CACHE_KEY = CacheService.getProductDetailKey(slug);
  let product: TProduct | null = await CacheService.get<TProduct>(CACHE_KEY);

  if (product) return product;

  try {
    const client = await getServerApolloClient();
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

  const title = product.metaTitle || product.name;
  const description = product.metaDescription || product.description?.substring(0, 160) || `Buy ${product.name} at the best price in Nepal.`;
  const keywords = product.keywords && product.keywords.length > 0 ? product.keywords : [`buy ${product.name} online`, `${product.name} price in Nepal`];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `/product/${slug}`,
    },
    openGraph: {
      title,
      description,
      images: productImage ? [productImage, ...previousImages] : previousImages,
      url: `/product/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
  let product: TProduct | null = null;
  const CACHE_KEY = CacheService.getProductDetailKey(slug);

  try {
    /*
    // 1. Try Cache First
    product = await CacheService.get<TProduct>(CACHE_KEY);
    */

    // 2. If not in Cache, fetch from DB
    if (!product) {
      const client = await getServerApolloClient();
      const { data, error, errors } = await client.query({
        query: GET_PRODUCT_BY_SLUG,
        variables: { slug },
        fetchPolicy: "no-cache",
      });

      if (error || (errors && errors.length > 0)) {
        const errorMsg = error?.message || errors?.[0]?.message || "GraphQL Error";
        console.error("GraphQL error:", errorMsg);
        // We return a small error UI here instead of crashing
        return <div className="p-8 text-center text-red-500">Error: {errorMsg}</div>;
      }

      product = data?.getProductBySlug;

      if (product) {
        await CacheService.set(CACHE_KEY, product, 3600);
      }
    }
  } catch (err: any) {
    console.error("Caught exception during ProductPage data fetching:", err);
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
        <div className="p-6 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30 max-w-2xl w-full">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
            {err.name === "ApolloError" ? "Fetch Failed" : "Something went wrong"}
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            We encountered an issue while loading this product. This may be a temporary network issue.
          </p>
          {process.env.NODE_ENV !== "production" && (
            <pre className="mt-4 p-4 bg-white dark:bg-black/40 rounded border border-red-100 dark:border-red-900/30 overflow-auto text-left text-xs text-red-500 font-mono">
              {err.message}
            </pre>
          )}
          <a
            href={`/product/${slug}`}
            className="mt-6 inline-block px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            Try Again
          </a>
        </div>
      </div>
    );
  }

  // Handle case where product is still null (from DB and no error)
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <p className="text-gray-500 mt-2">The product you're looking for doesn't exist or is unavailable.</p>
        <a href="/" className="mt-6 text-primary hover:underline">Return Home</a>
      </div>
    );
  }

  // Force serialize product to ensure it's a plain object for Client Components
  // This prevents crashes in production due to non-serializable fields like Dates or Decimals
  const serializableProduct = JSON.parse(JSON.stringify(product));

  const initialCacheData = {
    currentProduct: serializableProduct,
  };

  const currentPrice = serializableProduct.variants?.[0]?.price
    ? Number(serializableProduct.variants[0].price)
    : 0;
  // Ensure stock is treated as a number
  const stockValue = serializableProduct.variants?.[0]?.stock;
  const stock = stockValue ? Number(stockValue) : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: serializableProduct.name,
    image: serializableProduct.images?.map((img: any) => img.url) || [],
    description: serializableProduct.description,
    sku: serializableProduct.variants?.[0]?.sku || "",
    brand: {
      "@type": "Brand",
      name:
        typeof serializableProduct.brand === "string"
          ? serializableProduct.brand
          : serializableProduct.brand?.name || "Generic",
    },
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_APP_URL || "https://vanijay.com"}/product/${slug}`,
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
        item: process.env.NEXT_PUBLIC_APP_URL || "https://vanijay.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: serializableProduct.category?.name || "Shop",
        item: `${process.env.NEXT_PUBLIC_APP_URL || "https://vanijay.com"}/shop`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: serializableProduct.name,
        item: `${process.env.NEXT_PUBLIC_APP_URL || "https://vanijay.com"}/product/${slug}`,
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
      <ProductPageClient product={serializableProduct} />
    </SSRApolloProvider>
  );
}
