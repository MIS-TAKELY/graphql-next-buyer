"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function ProductDetailSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            {/* Breadcrumb skeleton - simplified */}
            <div className="container-custom py-3">
                <div className="flex items-center gap-2">
                    <div className="h-3.5 w-12 bg-secondary/30 rounded animate-pulse" />
                    <div className="h-3.5 w-1 bg-secondary/20 rounded" />
                    <div className="h-3.5 w-24 bg-secondary/30 rounded animate-pulse" />
                    <div className="h-3.5 w-1 bg-secondary/20 rounded" />
                    <div className="h-3.5 w-32 bg-secondary/30 rounded animate-pulse" />
                </div>
            </div>

            <div className="container-custom py-4 sm:py-6 lg:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-8 xl:gap-12 mb-12">
                    {/* LEFT COLUMN - Image Gallery Skeleton */}
                    <div className="space-y-4">
                        {/* Main image skeleton with better shimmer */}
                        <div className="aspect-square w-full bg-secondary/10 relative overflow-hidden rounded-lg border border-border/50">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/20 to-transparent animate-shimmer"
                                style={{
                                    backgroundSize: '200% 100%',
                                    animation: 'shimmer 2s infinite'
                                }} />
                        </div>

                        {/* Thumbnail gallery skeleton - cleaner */}
                        <div className="flex gap-2 overflow-x-auto">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-16 h-16 flex-shrink-0 bg-secondary/20 rounded border border-border/30 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/30 to-transparent animate-shimmer"
                                        style={{
                                            backgroundSize: '200% 100%',
                                            animation: 'shimmer 2s infinite',
                                            animationDelay: `${i * 0.1}s`
                                        }} />
                                </div>
                            ))}
                        </div>

                        {/* Action buttons skeleton - simplified */}
                        <div className="flex gap-3 pt-2">
                            <div className="flex-1 h-11 bg-primary/10 rounded-md relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-shimmer"
                                    style={{
                                        backgroundSize: '200% 100%',
                                        animation: 'shimmer 2s infinite'
                                    }} />
                            </div>
                            <div className="h-11 w-11 bg-secondary/20 rounded-md animate-pulse" />
                            <div className="h-11 w-11 bg-secondary/20 rounded-md animate-pulse" />
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Product Info Skeleton */}
                    <div className="space-y-6">
                        {/* Title skeleton - cleaner */}
                        <div className="space-y-3">
                            <div className="h-7 w-4/5 bg-secondary/20 rounded animate-pulse" />
                            <div className="h-7 w-3/5 bg-secondary/20 rounded animate-pulse" />
                        </div>

                        {/* Rating skeleton */}
                        <div className="flex items-center gap-4">
                            <div className="h-5 w-28 bg-secondary/20 rounded-full animate-pulse" />
                            <div className="h-5 w-36 bg-secondary/20 rounded-full animate-pulse" />
                        </div>

                        {/* Price skeleton */}
                        <div className="space-y-2 py-2">
                            <div className="h-9 w-36 bg-primary/10 rounded animate-pulse" />
                            <div className="h-4 w-28 bg-secondary/20 rounded animate-pulse" />
                        </div>

                        {/* Variant selectors skeleton - cleaner */}
                        <div className="space-y-5 pt-2">
                            <div>
                                <div className="h-4 w-16 bg-secondary/20 rounded mb-3 animate-pulse" />
                                <div className="flex gap-2">
                                    {[...Array(4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-10 w-14 bg-secondary/15 rounded border border-border/30 animate-pulse"
                                            style={{ animationDelay: `${i * 0.05}s` }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="h-4 w-16 bg-secondary/20 rounded mb-3 animate-pulse" />
                                <div className="flex gap-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-10 w-14 bg-secondary/15 rounded border border-border/30 animate-pulse"
                                            style={{ animationDelay: `${i * 0.05}s` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Delivery & Seller info skeleton - cleaner cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 pt-2">
                            <Card className="border-border/50">
                                <CardContent className="p-4">
                                    <div className="h-4 w-24 bg-secondary/20 rounded mb-3 animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="h-3.5 w-full bg-secondary/15 rounded animate-pulse" />
                                        <div className="h-3.5 w-4/5 bg-secondary/15 rounded animate-pulse" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-border/50">
                                <CardContent className="p-4">
                                    <div className="h-4 w-24 bg-secondary/20 rounded mb-3 animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="h-3.5 w-full bg-secondary/15 rounded animate-pulse" />
                                        <div className="h-3.5 w-4/5 bg-secondary/15 rounded animate-pulse" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Tabs skeleton - minimal and clean */}
                <div className="mb-12 pb-12 border-b border-border/50">
                    <div className="flex gap-3 mb-6">
                        <div className="h-10 w-32 bg-secondary/15 rounded animate-pulse" />
                        <div className="h-10 w-28 bg-secondary/10 rounded animate-pulse" />
                        <div className="h-10 w-28 bg-secondary/10 rounded animate-pulse" />
                    </div>
                    <Card className="border-border/50">
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <div className="h-3.5 w-32 bg-secondary/15 rounded animate-pulse" />
                                        <div className="h-3.5 w-24 bg-secondary/15 rounded animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recommended products skeleton - cleaner */}
                <div className="space-y-6">
                    <div className="h-7 w-48 bg-secondary/20 rounded animate-pulse" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-3">
                                <div className="aspect-[4/5] bg-secondary/10 rounded relative overflow-hidden border border-border/30">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/20 to-transparent animate-shimmer"
                                        style={{
                                            backgroundSize: '200% 100%',
                                            animation: 'shimmer 2s infinite',
                                            animationDelay: `${i * 0.15}s`
                                        }} />
                                </div>
                                <div className="space-y-2 px-1">
                                    <div className="h-4 w-3/4 bg-secondary/15 rounded animate-pulse" />
                                    <div className="h-3 w-1/2 bg-secondary/10 rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
        </div>
    );
}
