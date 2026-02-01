import ProductCard from "@/components/page/home/ProductCard";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db/prisma";
import { APP_URL } from "@/config/env";
import { TProduct } from "@/types/product";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Metadata, ResolvingMetadata } from "next";
import { cache } from "react";

export const revalidate = 3600;

// Generate static params for all active seller stores
export async function generateStaticParams() {
  try {
    const sellers = await prisma.sellerProfile.findMany({
      where: {
        isActive: true,
        verificationStatus: "APPROVED"
      },
      select: { slug: true },
    });

    return sellers.map((seller) => ({
      storeId: seller.slug,
    }));
  } catch (error) {
    console.error("Error generating static params for stores:", error);
    return [];
  }
}

type Props = {
  params: Promise<{ storeId: string }>;
};

// Cached function to fetch seller profile (supports both slug and userId)
const fetchSellerProfile = cache(async (storeId: string) => {
  try {
    // First try to find by slug (SEO-friendly)
    let sellerProfile = await prisma.sellerProfile.findUnique({
      where: {
        slug: storeId
      },
      select: {
        id: true,
        userId: true,
        shopName: true,
        slug: true,
        logo: true,
        banner: true,
        description: true,
        tagline: true,
        metaTitle: true,
        metaDescription: true,
        keywords: true,
        updatedAt: true,
        isActive: true,
        verificationStatus: true,
      }
    });

    // Fallback: try to find by userId for backwards compatibility
    if (!sellerProfile) {
      sellerProfile = await prisma.sellerProfile.findFirst({
        where: {
          userId: storeId,
        },
        select: {
          id: true,
          userId: true,
          shopName: true,
          slug: true,
          logo: true,
          banner: true,
          description: true,
          tagline: true,
          metaTitle: true,
          metaDescription: true,
          keywords: true,
          updatedAt: true,
          isActive: true,
          verificationStatus: true,
        }
      });
    }

    return sellerProfile;
  } catch (error) {
    console.error("Error fetching seller profile:", error);
    return null;
  }
});

// Cached function to fetch products by seller
const fetchProductsBySeller = cache(async (userId: string) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        sellerId: userId,
        status: "ACTIVE"
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        category: true,
        reviews: {
          where: { status: "APPROVED" },
          select: { rating: true }
        },
        productOffers: {
          include: { offer: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return products as unknown as TProduct[];
  } catch (error) {
    console.error("Error fetching seller products:", error);
    return [];
  }
});

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { storeId } = await params;
  const sellerProfile = await fetchSellerProfile(storeId);

  if (!sellerProfile) {
    return {
      title: "Store Not Found | Vanijay Nepal",
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const baseUrl = APP_URL;
  const url = `${baseUrl}/store/${sellerProfile.slug}`;

  const title = sellerProfile.metaTitle || `${sellerProfile.shopName} | Shop on Vanijay Nepal`;
  const description = sellerProfile.metaDescription ||
    sellerProfile.description ||
    `Shop products from ${sellerProfile.shopName} on Vanijay. ${sellerProfile.tagline || 'Quality products at great prices.'}`;

  return {
    title,
    description: description.length > 160 ? description.substring(0, 157) + "..." : description,
    keywords: sellerProfile.keywords || [],
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      images: sellerProfile.logo ? [sellerProfile.logo, ...previousImages] : previousImages,
      url,
      type: "website",
      siteName: "Vanijay",
    },
  };
}

export default async function StorePage({ params }: Props) {
  const { storeId } = await params;

  const sellerProfile = await fetchSellerProfile(storeId);

  if (!sellerProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
        <h2 className="text-2xl font-bold">Store not found</h2>
        <p className="text-gray-500 mt-2">The store you're looking for doesn't exist or is unavailable.</p>
        <a href="/" className="mt-6 text-primary hover:underline">Return Home</a>
      </div>
    );
  }

  const products = await fetchProductsBySeller(sellerProfile.userId);

  const groupedProducts: Record<string, TProduct[]> = {};
  products.forEach((product) => {
    const categoryName = product.category?.name || "Other";
    if (!groupedProducts[categoryName]) {
      groupedProducts[categoryName] = [];
    }
    groupedProducts[categoryName].push(product);
  });

  const categoryNames = Object.keys(groupedProducts).sort();

  // Serialize products for client components
  const serializableGroupedProducts = JSON.parse(JSON.stringify(groupedProducts));

  const baseUrl = APP_URL;

  // JSON-LD for store/organization
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: sellerProfile.shopName,
    description: sellerProfile.description || sellerProfile.tagline,
    url: `${baseUrl}/store/${sellerProfile.slug}`,
    logo: sellerProfile.logo,
    image: sellerProfile.banner || sellerProfile.logo,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-custom py-8 min-h-screen">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{sellerProfile.shopName}</h1>
            {sellerProfile.tagline && (
              <p className="text-gray-600 text-sm">{sellerProfile.tagline}</p>
            )}
            <p className="text-gray-500 text-sm">{products.length} Products</p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No products found for this store.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {categoryNames.map((categoryName) => (
              <div key={categoryName}>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">{categoryName}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {serializableGroupedProducts[categoryName].map((product: TProduct) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
