import ProductPageClient from "@/components/page/product/ProductPageClient";
import Breadcrumb from "@/components/page/product/Breadcrumb";
import { SSRApolloProvider } from "@/lib/apollo/apollo-wrapper";
import { prisma } from "@/lib/db/prisma";
import { APP_URL } from "@/config/env";
import { TProduct } from "@/types/product";
import { Metadata, ResolvingMetadata } from "next";
import { cache } from "react";
import { formatPrice } from "@/lib/utils";
import { permanentRedirect } from "next/navigation";
import { extractProductIdFromSlug } from "@/lib/productUtils";

const PRODUCT_INCLUDES = {
  images: { orderBy: [{ mediaType: 'asc' as const }, { sortOrder: 'asc' as const }] },
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
    where: { status: "APPROVED" as const },
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
  questions: {
    where: { isPublic: true },
    include: {
      user: {
        select: { firstName: true, lastName: true }
      },
      answers: {
        include: {
          seller: {
            select: {
              firstName: true,
              lastName: true,
              sellerProfile: {
                select: { shopName: true }
              }
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' as const }
  },
  warranty: true,
  returnPolicy: true,
  deliveryOptions: true,
  seller: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      sellerProfile: {
        select: {
          shopName: true,
          slug: true,
          isActive: true,
          verificationStatus: true
        }
      }
    }
  }
};
export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, id: true },
    });

    return products.map((product) => ({
      slug: `${product.slug}-p${product.id}`,
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

// Consolidated fetching logic with smart lookup (ID -> Slug)
const fetchProduct = cache(async (slugParam: string) => {
  try {
    const extractedId = extractProductIdFromSlug(slugParam);
    let product = null;

    if (extractedId) {
      product = await prisma.product.findUnique({
        where: { id: extractedId, status: "ACTIVE" },
        include: PRODUCT_INCLUDES,
      });
    }

    if (!product) {
      // Fallback: search by slug (legacy URLs)
      product = await prisma.product.findUnique({
        where: { slug: slugParam, status: "ACTIVE" },
        include: PRODUCT_INCLUDES,
      });
    }

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
  // Always use the canonical URL format: /product/[slug]-p[id]
  const url = `${baseUrl}/product/${product.slug}-p${product.id}`;

  // Title: [Product Name] | [Brand] (Industry standard 40-60 chars)
  const brandName = typeof product.brand === "string" ? product.brand : product.brand?.name || "Vanijay";
  let title = product.metaTitle || `${product.name} | ${brandName}`;
  if (title.length > 60) {
    title = title.substring(0, 57) + "...";
  }

  // Neutral description (no price/stock, no marketing fluff, 110-140 chars)
  let description = product.metaDescription || product.description || `Explore the ${product.name} from ${brandName}, available on Vanijay. Detailed specifications and features included.`;

  // Clean description: remove prices or marketing phrases if they exist in DB content
  description = description.replace(/रु\s?\d+(,\d+)*/g, "").replace(/Rs\.?\s?\d+(,\d+)*/g, "").replace(/\d+(\.\d+)?%/g, "");

  if (description.length > 140) {
    description = description.substring(0, 137) + "...";
  }

  const currentPrice = product.variants?.[0]?.price ? Number(product.variants[0].price) : 0;
  const currentStock = product.variants?.[0]?.stock ? Number(product.variants[0].stock) : 0;

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
      images: productImage ? [
        {
          url: productImage,
          alt: product.name,
          width: 1200,
          height: 630,
        },
        ...previousImages
      ] : previousImages,
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
      "product:availability": "instock",
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

  const extractedId = extractProductIdFromSlug(slug);
  const correctSlug = `${product.slug}-p${product.id}`;

  if (extractedId) {
    // ID present in URL
    if (slug !== correctSlug) {
      // Mismatched cosmetic slug -> Redirect to canonical
      permanentRedirect(`/product/${correctSlug}`);
    }
  } else {
    // Legacy URL (no ID) -> Redirect to new format
    permanentRedirect(`/product/${correctSlug}`);
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
  const productUrl = `${baseUrl}/product/${product.slug}-p${product.id}`;

  // Use the same refined description logic for JSON-LD
  let structuredDescription = serializableProduct.metaDescription || serializableProduct.description || `Buy ${serializableProduct.name} at the best price in Nepal.`;
  if (structuredDescription.length > 160) {
    structuredDescription = structuredDescription.substring(0, 157) + "...";
  }

  // Detailed specifications and attributes for JSON-LD
  const additionalProperties: any[] = [];

  // Add specifications from the table if available
  if (serializableProduct.specificationTable && Array.isArray(serializableProduct.specificationTable)) {
    serializableProduct.specificationTable.forEach((table: any) => {
      if (table.rows && Array.isArray(table.rows)) {
        table.rows.forEach((row: any) => {
          if (Array.isArray(row) && row.length >= 2) {
            additionalProperties.push({
              "@type": "PropertyValue",
              name: row[0],
              value: row[1],
            });
          }
        });
      }
    });
  }

  // Add category specific specifications if available
  if (serializableProduct.category?.categorySpecification && Array.isArray(serializableProduct.category.categorySpecification)) {
    serializableProduct.category.categorySpecification.forEach((spec: any) => {
      additionalProperties.push({
        "@type": "PropertyValue",
        name: spec.label || spec.key,
        value: spec.value || "N/A",
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
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
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
        : "5.0",
      reviewCount: serializableProduct.reviews && serializableProduct.reviews.length > 0
        ? serializableProduct.reviews.length
        : 1,
      bestRating: "5",
      worstRating: "1"
    },
    ...(serializableProduct.reviews && serializableProduct.reviews.length > 0 ? {
      review: serializableProduct.reviews.map((review: any) => ({
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
      }))
    } : {
      review: [{
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
          worstRating: "1",
        },
        author: {
          "@type": "Organization",
          name: "Vanijay"
        },
        datePublished: serializableProduct.createdAt ? new Date(serializableProduct.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }]
    }),
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
        item: `${baseUrl}`,
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
        text: serializableProduct.warranty && serializableProduct.warranty.length > 0
          ? `Yes, ${serializableProduct.name} comes with ${serializableProduct.warranty[0].duration} ${serializableProduct.warranty[0].duration === 1 ? serializableProduct.warranty[0].unit.replace(/s$/, '') : serializableProduct.warranty[0].unit} ${serializableProduct.warranty[0].type.toLowerCase()} warranty.`
          : `Yes, ${serializableProduct.name} comes with manufacturer warranty as per Vanijay policies.`
      }
    },
    {
      "@type": "Question",
      name: `What is the return policy for ${serializableProduct.name}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: serializableProduct.returnPolicy && serializableProduct.returnPolicy.length > 0
          ? `The return policy for ${serializableProduct.name} is ${serializableProduct.returnPolicy[0].duration} ${serializableProduct.returnPolicy[0].duration === 1 ? serializableProduct.returnPolicy[0].unit.replace(/s$/, '') : serializableProduct.returnPolicy[0].unit} ${serializableProduct.returnPolicy[0].type.replace(/_/g, ' ').toLowerCase()}.`
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
    <div className="min-h-screen bg-background relative pb-20 lg:pb-0">
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

      {/* Prerendered Breadcrumb for SEO */}
      <Breadcrumb
        category={serializableProduct.category}
        name={serializableProduct.name}
      />

      {/* <div className="container-custom py-4 sm:py-6 lg:py-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[4.5fr_5.5fr] gap-8 xl:gap-12 mb-12">
          
          <div className="lg:hidden mb-6">
            <h1 className="text-2xl font-bold text-foreground">{serializableProduct.name}</h1>
          </div>
          <div className="hidden lg:block">
            {serializableProduct.images?.[0] && (
              <img
                src={serializableProduct.images[0].url}
                alt={serializableProduct.name}
                className="w-full h-auto rounded-lg"
                loading="eager"
                style={{ display: 'none' }} // Hidden for users, visible for crawlers/text-analysis
              />
            )}
          </div>
          <div className="sr-only">
            <h2>About {serializableProduct.name}</h2>
            <p>{serializableProduct.description}</p>
          </div>
        </div>
      </div> */}

      <SSRApolloProvider initialData={initialCacheData}>
        <ProductPageClient product={serializableProduct} />
      </SSRApolloProvider>
    </div>
  );
}
