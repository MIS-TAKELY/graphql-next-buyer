'use client';

import React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface Keyword {
    id: string;
    name: string;
    href: string;
    targetType: string;
    clickCount: number;
}

interface Category {
    id: string;
    title: string;
    keywords: Keyword[];
}

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        // Attach extra info to the error object.
        (error as any).info = await res.json();
        (error as any).status = res.status;
        throw error;
    }
    return res.json();
};

const PopularSearches = () => {
    const { data, error, isLoading } = useSWR<Category[]>('/api/popular-searches', fetcher, {
        refreshInterval: 300000, // 5 minutes
        revalidateOnFocus: false,
    });

    if (error) return null; // Error fallback: hide section
    if (isLoading) return <PopularSearchesSkeleton />;
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    return (
        <section className="w-full py-8 bg-muted/30 border-t mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-foreground">Popular Searches on Vanijay</h2>
                    <p className="text-sm text-muted-foreground">Trending categories and keywords</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {data.map((category) => (
                        <div key={category.id} className="flex flex-col gap-2">
                            <h3 className="font-semibold text-foreground/90 mb-2">{category.title}</h3>
                            <div className="flex flex-wrap gap-2">
                                {category.keywords.map((keyword) => {
                                    // Helper to construct valid URL
                                    const getHref = (url: string) => {
                                        if (!url) return '#';
                                        if (url.startsWith('http') || url.startsWith('/')) return url;
                                        if (url.startsWith('www.')) return `https://${url}`;
                                        // Assume it's a search query if not a URL
                                        return `/search?q=${encodeURIComponent(url)}`;
                                    };

                                    return (
                                        <Link
                                            key={keyword.id}
                                            href={getHref(keyword.href)}
                                            target={keyword.targetType === '_blank' ? '_blank' : '_self'}
                                            className="inline-flex items-center px-3 py-1 rounded-full bg-card border border-border text-sm text-foreground/80 hover:bg-accent hover:border-primary/30 hover:text-primary transition-all cursor-pointer shadow-sm relative z-10"
                                        // TODO: Add click tracking here
                                        >
                                            {keyword.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const PopularSearchesSkeleton = () => {
    return (
        <div className="w-full py-8 border-t mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <Skeleton className="h-5 w-32 mb-2" />
                            <div className="flex flex-col gap-2">
                                {[1, 2, 3, 4, 5].map((j) => (
                                    <Skeleton key={j} className="h-4 w-full" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PopularSearches;
