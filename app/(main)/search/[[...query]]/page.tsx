import { Metadata } from "next";
import SearchPageClient from "./SearchPageClient";

export async function generateMetadata({
    params,
    searchParams
}: {
    params: Promise<{ query?: string[] }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
    const { q } = await searchParams;
    const searchQuery = typeof q === 'string' ? q : '';

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.vanijay.com';
    const canonical = searchQuery ? `${baseUrl}/search?q=${encodeURIComponent(searchQuery)}` : `${baseUrl}/search`;

    const title = searchQuery
        ? `Search results for "${searchQuery}"`
        : "Search Products";

    const description = searchQuery
        ? `Browse the best search results for "${searchQuery}" on Vanijay. Find quality products at the best prices.`
        : "Search for electronics, fashion, and more on Vanijay. Modern e-commerce platform for online shopping in Nepal.";

    return {
        title,
        description,
        alternates: {
            canonical: canonical,
        },
        robots: {
            // Don't index search results to avoid thin content, but follow links
            index: false,
            follow: true,
        }
    };
}

export default function SearchPage() {
    return <SearchPageClient />;
}
