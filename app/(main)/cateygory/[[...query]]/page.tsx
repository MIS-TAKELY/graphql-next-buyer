import { Metadata } from 'next';
import CategoryPageClient from "./CategoryPageClient";

export async function generateMetadata({ params }: { params: Promise<{ query?: string[] }> }): Promise<Metadata> {
    const { query } = await params;
    const categoryName = query?.[0] ? decodeURIComponent(query[0]) : "All Products";
    const title = `${categoryName} | Shop | Dai`;

    return {
        title,
        description: `Browse our collection of ${categoryName}. Find the best deals and products.`,
        alternates: {
            canonical: `/shop/cateygory/${query?.join('/') || ''}`,
        },
        openGraph: {
            title,
            description: `Browse our collection of ${categoryName}.`,
        }
    };
}

export default async function CategoryPage({ params }: { params: Promise<{ query?: string[] }> }) {
    const { query } = await params;

    return (
        <CategoryPageClient params={{ query }} />
    );
}
