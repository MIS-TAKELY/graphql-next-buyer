export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { GET_SEO_PAGE_BY_PATH } from "@/client/seo/seo.queries";
import { GET_PRODUCTS_BY_CATEGORY } from "@/client/category/category.queries";
import { APP_URL } from "@/config/env";
import SeoPageClient from "./SeoPageClient";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const path = `/${slug}`;
    console.log(`DEBUG: slug=${slug}, path=${path}`);

    try {
        const client = await getServerApolloClient();
        console.log("DEBUG: Querying GET_SEO_PAGE_BY_PATH with path:", path);
        const { data } = await client.query({
            query: GET_SEO_PAGE_BY_PATH,
            variables: { path },
        });

        const seoPage = data?.seoPageByPath;
        console.log("DEBUG: seoPage result:", seoPage ? "FOUND" : "NULL", seoPage);

        if (!seoPage) {
            return {};
        }

        // Fetch first few products to get images for OG tags
        const productsData = await client.query({
            query: GET_PRODUCTS_BY_CATEGORY,
            variables: {
                categorySlug: seoPage.category.slug,
                limit: 5,
                offset: 0,
                maxPrice: seoPage.priceThreshold
            }
        });

        const products = productsData?.data?.getProductsByCategory?.products || [];
        const ogImages = products
            .map((p: any) => p.images?.[0]?.url)
            .filter(Boolean)
            .map((url: string) => ({ url, width: 1200, height: 630 }));

        return {
            title: seoPage.metaTitle || `${seoPage.category.name} under Rs. ${seoPage.priceThreshold}`,
            description: seoPage.metaDescription || `Browse the best collection of ${seoPage.category.name} under ${seoPage.priceThreshold}. Check prices and ratings.`,
            alternates: {
                canonical: `${APP_URL}${seoPage.urlPath}`,
            },
            openGraph: {
                title: seoPage.metaTitle,
                description: seoPage.metaDescription,
                images: ogImages.length > 0 ? ogImages : [{ url: "/og-image.jpg" }],
                type: 'website'
            },
            twitter: {
                card: "summary_large_image",
                images: ogImages.length > 0 ? [ogImages[0].url] : ["/og-image.jpg"],
            }
        };
    } catch (e) {
        return {};
    }
}

export default async function DynamicSeoPage({ params }: PageProps) {
    const { slug } = await params;
    const path = `/${slug}`;
    console.log(`DEBUG: slug=${slug}, path=${path}`);

    try {
        const client = await getServerApolloClient();
        console.log("DEBUG: Querying GET_SEO_PAGE_BY_PATH with path:", path);
        const { data } = await client.query({
            query: GET_SEO_PAGE_BY_PATH,
            variables: { path },
        });

        const seoPage = data?.seoPageByPath;
        console.log("DEBUG: seoPage result:", seoPage ? "FOUND" : "NULL", seoPage);

        if (!seoPage) {
            notFound();
        }

        // Fetch initial products for server-side structured data
        const productsData = await client.query({
            query: GET_PRODUCTS_BY_CATEGORY,
            variables: {
                categorySlug: seoPage.category.slug,
                limit: 10,
                offset: 0,
                maxPrice: seoPage.priceThreshold
            }
        });

        const initialProducts = productsData?.data?.getProductsByCategory?.products || [];

        return <SeoPageClient seoPage={seoPage} initialProducts={initialProducts} />;
    } catch (e) {
        console.error("SEO Page fetch error:", e);
        notFound();
    }
}
