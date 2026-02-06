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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const PopularSearches = () => {
    const { data, error, isLoading } = useSWR<Category[]>('/api/popular-searches', fetcher, {
        refreshInterval: 300000, // 5 minutes
        revalidateOnFocus: false,
    });

    if (error) return null; // Error fallback: hide section
    if (isLoading) return <PopularSearchesSkeleton />;
    if (!data || data.length === 0) return null;

    return (
        <section className="w-full py-8 bg-gray-50 border-t mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Popular Searches on Vanijay</h2>
                    <p className="text-sm text-gray-500">Trending categories and keywords</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {data.map((category) => (
                        <div key={category.id} className="flex flex-col gap-2">
                            <h3 className="font-semibold text-gray-800 mb-2">{category.title}</h3>
                            <div className="flex flex-wrap gap-2">
                                {category.keywords.map((keyword) => (
                                    <Link
                                        key={keyword.id}
                                        href={keyword.href}
                                        target={keyword.targetType === '_blank' ? '_blank' : '_self'}
                                        className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all cursor-pointer shadow-sm"
                                    // TODO: Add click tracking here
                                    >
                                        {keyword.name}
                                    </Link>
                                ))}
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
