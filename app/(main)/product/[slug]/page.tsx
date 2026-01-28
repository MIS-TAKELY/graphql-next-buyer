import ProductPageClient from "@/components/page/product/ProductPageClient";
import { SSRApolloProvider } from "@/lib/apollo/apollo-wrapper";
import { prisma } from "@/lib/db/prisma";
import { TProduct } from "@/types/product";
import { Metadata, ResolvingMetadata } from "next";
import { cache } from "react";

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Consolidate fetching logic with Prisma for direct DB access
const fetchProduct = cache(async (slug: string) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug, status: "ACTIVE" },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: {
          include: {
            specifications: true
          }
        },
        category: {
          include: {
            categorySpecification: true
          }
        },
        reviews: {
          where: { status: "APPROVED" },
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        },
        productOffers: {
          include: {
            offer: true
          }
        },
        warranty: true,
        returnPolicy: true
      }
    });

    return product as unknown as TProduct;
  } catch (error) {
    console.error("Error fetching product via Prisma:", error);
    return null;
  }
});

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found | Vanijay Nepal",
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const productImage = product.images?.[0]?.url;

  const baseUrl = process.env.NODE_ENV === "production" ? "https://www.vanijay.com" : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
  const url = `${baseUrl}/product/${slug}`;

  // Title: [Product Name] | Price in Nepal | Vanijay
  let title = product.metaTitle || `${product.name} | Price in Nepal | Vanijay`;
  if (title.length > 60) {
    title = title.substring(0, 57) + "...";
  }

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
  const product = await fetchProduct(slug);

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

  // Detailed specifications and attributes for JSON-LD
  const additionalProperties: any[] = [];

  // Add specifications from the table if available
  if (serializableProduct.specificationTable && Array.isArray(serializableProduct.specificationTable)) {
    serializableProduct.specificationTable.forEach((spec: any) => {
      additionalProperties.push({
        "@type": "PropertyValue",
        name: spec.key,
        value: spec.value,
      });
    });
  }

  // Add category specific specifications if available
  if (serializableProduct.category?.categorySpecification) {
    serializableProduct.category.categorySpecification.forEach((spec: any) => {
      additionalProperties.push({
        "@type": "PropertyValue",
        name: spec.label || spec.key,
        value: spec.value || "N/A", // This might need mapping to actual product values if they exist
      });
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: serializableProduct.name,
    image: serializableProduct.images?.map((img: any) => img.url) || [],
    description: structuredDescription,
    sku: serializableProduct.variants?.[0]?.sku || `VJ-${serializableProduct.id.substring(0, 8)}`,
    mpn: serializableProduct.variants?.[0]?.sku || serializableProduct.id,
    brand: {
      "@type": "Brand",
      name:
        typeof serializableProduct.brand === "string"
          ? serializableProduct.brand
          : serializableProduct.brand?.name || "Vanijay",
    },
    additionalProperty: additionalProperties.length > 0 ? additionalProperties : undefined,
    offers: serializableProduct.variants?.map((variant: any) => {
      const vPrice = Number(variant.price) || 0;
      const vStock = Number(variant.stock) || 0;

      return {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "NPR",
        price: vPrice,
        itemCondition: "https://schema.org/NewCondition",
        availability: vStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        sku: variant.sku,
        seller: {
          "@type": "Organization",
          name: "Vanijay",
        },
      };
    }),
    aggregateRating: serializableProduct.reviews && serializableProduct.reviews.length > 0 ? {
      "@type": "AggregateRating",
      ratingValue: serializableProduct.reviews.reduce((acc: number, review: any) => acc + (review.rating || 0), 0) / serializableProduct.reviews.length,
      reviewCount: serializableProduct.reviews.length,
      bestRating: "5",
      worstRating: "1",
    } : undefined,
    review: serializableProduct.reviews?.map((review: any) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: "5",
        worstRating: "1",
      },
      author: {
        "@type": "Person",
        name: review.user ? `${review.user.firstName} ${review.user.lastName}` : "Anonymous",
      },
      datePublished: review.createdAt ? new Date(review.createdAt).toISOString().split('T')[0] : undefined,
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
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: serializableProduct.category?.name || "Shop",
        item: `${baseUrl}/shop`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: serializableProduct.name,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <SSRApolloProvider initialData={initialCacheData}>
        <ProductPageClient product={serializableProduct} />
      </SSRApolloProvider>
    </>
  );
}
