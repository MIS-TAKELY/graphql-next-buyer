import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { GET_SEO_PAGE_BY_PATH } from "@/client/seo/seo.queries";
import { APP_URL } from "@/config/env";
import SeoPageClient from "./SeoPageClient";

interface PageProps {
    params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const path = `/${slug.join('/')}`;

    try {
        const client = await getServerApolloClient();
        const { data } = await client.query({
            query: GET_SEO_PAGE_BY_PATH,
            variables: { path },
        });

        const seoPage = data?.seoPageByPath;

        if (!seoPage) {
            return {};
        }

        return {
            title: seoPage.metaTitle || seoPage.category.name,
            description: seoPage.metaDescription || seoPage.category.description,
            alternates: {
                canonical: `${APP_URL}${seoPage.urlPath}`,
            },
            openGraph: {
                title: seoPage.metaTitle,
                description: seoPage.metaDescription,
            }
        };
    } catch (e) {
        return {};
    }
}

export default async function DynamicSeoPage({ params }: PageProps) {
    const { slug } = await params;
    const path = `/${slug.join('/')}`;

    try {
        const client = await getServerApolloClient();
        const { data } = await client.query({
            query: GET_SEO_PAGE_BY_PATH,
            variables: { path },
        });

        const seoPage = data?.seoPageByPath;

        if (!seoPage) {
            notFound();
        }

        return <SeoPageClient seoPage={seoPage} />;
    } catch (e) {
        console.error("SEO Page fetch error:", e);
        notFound();
    }
}
