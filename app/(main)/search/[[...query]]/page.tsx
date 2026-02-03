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

    const title = searchQuery
        ? `Search results for "${searchQuery}" | Vanijay Nepal`
        : "Search Products | Vanijay Nepal";

    const description = searchQuery
        ? `Browse the best search results for "${searchQuery}" on Vanijay Nepal. Find quality products at the best prices.`
        : "Search for electronics, fashion, and more on Vanijay. Modern e-commerce platform for seamless online shopping in Nepal.";

    return {
        title,
        description,
        alternates: {
            // Use standard search URL for canonical
            canonical: searchQuery ? `/search?q=${encodeURIComponent(searchQuery)}` : "/search",
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
