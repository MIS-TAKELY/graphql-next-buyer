import { GET_PRODUCT_BY_SLUG } from "@/client/product/product.queries";
import ProductPageClient from "@/components/page/product/ProductPageClient";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { SSRApolloProvider } from "@/lib/apollo/apollo-wrapper";
import { CacheService } from "@/services/CacheService";
import { TProduct } from "@/types/product";
import { Metadata, ResolvingMetadata } from "next";
import { cache } from "react";

export const revalidate = 3600; // Enable ISR for better performance and indexability

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Cached data fetcher to deduplicate requests between generateMetadata and page
const getProduct = cache(async (slug: string) => {
  const CACHE_KEY = CacheService.getProductDetailKey(slug);

  // 1. Try Cache First (Redis)
  let product: TProduct | null = await CacheService.get<TProduct>(CACHE_KEY);

  if (product) return product;

  try {
    // 2. If not in Cache, fetch from DB via GraphQL
    const client = await getServerApolloClient();
    const { data } = await client.query({
      query: GET_PRODUCT_BY_SLUG,
      variables: { slug },
      fetchPolicy: "no-cache",
    });
    product = data?.getProductBySlug as TProduct | null;

    if (product) {
      // 3. Store in Cache
      await CacheService.set(CACHE_KEY, product, 3600);
    }

    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
});

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

  const baseUrl = process.env.NODE_ENV === "production" ? "https://www.vanijay.com" : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
  const url = `${baseUrl}/product/${slug}`;

  // Simplify title: [Product Name] Price in Nepal | Vanijay
  const title = product.metaTitle || `${product.name} Price in Nepal | Vanijay`;

  // High quality description (no truncation mid-sentence, 150-160 chars)
  let description = product.metaDescription || product.description || `Buy ${product.name} at the best price in Nepal. Fast delivery and secure payment at Vanijay.`;
  if (description.length > 160) {
    description = description.substring(0, 157) + "...";
  }

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      }
    },
    openGraph: {
      title,
      description,
      images: productImage ? [productImage, ...previousImages] : previousImages,
      url,
      type: "website",
      siteName: "Vanijay",
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

  // Fetch product using the cached function
  const product = await getProduct(slug);

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

  const baseUrl = process.env.NODE_ENV === "production" ? "https://www.vanijay.com" : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
  const productUrl = `${baseUrl}/product/${slug}`;

  // Use the same refined description logic for JSON-LD
  let structuredDescription = serializableProduct.metaDescription || serializableProduct.description || `Buy ${serializableProduct.name} at the best price in Nepal.`;
  if (structuredDescription.length > 160) {
    structuredDescription = structuredDescription.substring(0, 157) + "...";
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: serializableProduct.name,
    image: serializableProduct.images?.map((img: any) => img.url) || [],
    description: structuredDescription,
    sku: serializableProduct.variants?.[0]?.sku || `VJ-${serializableProduct.id.substring(0, 8)}`,
    brand: {
      "@type": "Brand",
      name:
        typeof serializableProduct.brand === "string"
          ? serializableProduct.brand
          : serializableProduct.brand?.name || "Generic",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "NPR",
      price: currentPrice,
      itemCondition: "https://schema.org/NewCondition",
      availability:
        stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      seller: {
        "@type": "Organization",
        name: "Vanijay",
      },
    },
    aggregateRating: serializableProduct.reviews && serializableProduct.reviews.length > 0 ? {
      "@type": "AggregateRating",
      ratingValue: serializableProduct.reviews.reduce((acc: number, review: any) => acc + (review.rating || 0), 0) / serializableProduct.reviews.length,
      reviewCount: serializableProduct.reviews.length,
    } : undefined,
    review: serializableProduct.reviews?.map((review: any) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: "5",
      },
      author: {
        "@type": "Person",
        name: review.user ? `${review.user.firstName} ${review.user.lastName}` : "Anonymous",
      },
    })),
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
