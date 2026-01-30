import ProductPageClient from "@/components/page/product/ProductPageClient";
import { SSRApolloProvider } from "@/lib/apollo/apollo-wrapper";
import { prisma } from "@/lib/db/prisma";
import { APP_URL } from "@/config/env";
import { TProduct } from "@/types/product";
import { Metadata, ResolvingMetadata } from "next";
import { cache } from "react";
import { formatPrice } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true },
    });

    return products.map((product) => ({
      slug: product.slug,
    }));
  } catch (error) {
    console.error("Error generating static params for products:", error);
    return [];
  }
}

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

  const baseUrl = APP_URL;
  const url = `${baseUrl}/product/${slug}`;

  // Title: [Product Name] | Price in Nepal | Vanijay
  let title = product.metaTitle || `${product.name} | Price in Nepal | Vanijay`;
  if (title.length > 60) {
    title = title.substring(0, 57) + "...";
  }

  // High quality description (no truncation mid-sentence, 150-160 chars)
  const currentPrice = product.variants?.[0]?.price ? Number(product.variants[0].price) : 0;
  const currentStock = product.variants?.[0]?.stock ? Number(product.variants[0].stock) : 0;
  
  let description = product.metaDescription || 
    `${product.description ? product.description.substring(0, 100) + (product.description.length > 100 ? "..." : "") : `Buy ${product.name}`} at रु${currentPrice.toLocaleString()} ${
      currentStock > 0 ? "with free delivery in Nepal. 1-year warranty. Available now" : "currently out of stock"
    }. Best prices at Vanijay.`;
    
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
    other: {
      "geo.region": "NP",
      "geo.placename": "Nepal",
      "product:price:amount": currentPrice.toString(),
      "product:price:currency": "NPR",
      "product:availability": currentStock > 0 ? "instock" : "outofstock",
    }
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

  const baseUrl = APP_URL;
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
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: "0",
            currency: "NPR"
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "NP"
          }
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 7,
          returnMethod: "https://schema.org/ReturnByMail",
          returnFees: "https://schema.org/FreeReturnShipping"
        },
        priceValidUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 180 days from now
        sku: variant.sku,
        seller: {
          "@type": "Organization",
          name: "Vanijay Enterprises",
          url: "https://vanijay.com",
          logo: "https://vanijay.com/final_blue_logo_500by500.svg"
        },
      };
    }),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: serializableProduct.reviews && serializableProduct.reviews.length > 0 
        ? (serializableProduct.reviews.reduce((acc: number, review: any) => acc + (review.rating || 0), 0) / serializableProduct.reviews.length).toString()
        : "0",
      reviewCount: serializableProduct.reviews?.length || 0,
      bestRating: "5",
      worstRating: "0"
    },
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

  // FAQ Schema - Include common product questions
  const faqQuestions = [
    {
      "@type": "Question",
      name: `Does ${serializableProduct.name} come with a warranty?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: serializableProduct.warranty 
          ? `Yes, ${serializableProduct.name} comes with ${serializableProduct.warranty}.` 
          : `Yes, ${serializableProduct.name} comes with manufacturer warranty as per Vanijay policies.`
      }
    },
    {
      "@type": "Question", 
      name: `What is the return policy for ${serializableProduct.name}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: serializableProduct.returnPolicy 
          ? `The return policy for ${serializableProduct.name} is ${serializableProduct.returnPolicy}.` 
          : `You can return ${serializableProduct.name} within 7 days of delivery in original condition for a full refund.`
      }
    },
    {
      "@type": "Question",
      name: `How much does ${serializableProduct.name} cost in Nepal?`,
      acceptedAnswer: {
        "@type": "Answer", 
        text: `The price of ${serializableProduct.name} in Nepal is ${formatPrice(currentPrice)} NPR at Vanijay.`
      }
    }
  ];

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqQuestions
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <SSRApolloProvider initialData={initialCacheData}>
        <ProductPageClient product={serializableProduct} />
      </SSRApolloProvider>
    </>
  );
}
