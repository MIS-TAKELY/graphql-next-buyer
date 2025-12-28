import { Metadata } from 'next';
import CategoryPageClient from "./CategoryPageClient";
import { GET_CATEGORY_BY_SLUG } from "@/client/category/category.queries";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";

export async function generateMetadata({ params }: { params: Promise<{ query?: string[] }> }): Promise<Metadata> {
    const { query } = await params;
    const slug = query?.[query.length - 1] || "";

    let category = null;

    if (slug) {
        try {
            const client = await getServerApolloClient();
            const { data } = await client.query({
                query: GET_CATEGORY_BY_SLUG,
                variables: { slug },
                fetchPolicy: "no-cache"
            });
            category = data?.categoryBySlug;
        } catch (e) {
            console.error("Error fetching category metadata", e);
        }
    }

    const categoryName = category?.name || (query?.[0] ? decodeURIComponent(query[0]) : "All Products");
    const title = category?.metaTitle || `${categoryName} | Shop | Vanijay`;
    const description = category?.metaDescription || category?.description || `Browse our collection of ${categoryName}. Find the best deals and products.`;
    const keywords = category?.keywords || [`buy ${categoryName}`, `${categoryName} Nepal`];

    return {
        title,
        description,
        keywords,
        alternates: {
            canonical: `/category/${query?.join('/') || ''}`,
        },
        openGraph: {
            title,
            description,
        }
    };
}

export default async function CategoryPage({ params }: { params: Promise<{ query?: string[] }> }) {
    const { query } = await params;

    return (
        <CategoryPageClient params={{ query }} />
    );
}
