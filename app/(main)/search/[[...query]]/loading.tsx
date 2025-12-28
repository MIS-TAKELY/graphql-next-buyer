
import { ProductCardSkeleton } from "@/components/page/home/ProductCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* Header Skeleton */}
                <div className="flex flex-col gap-3 lg:flex-row lg:gap-4 mb-4">
                    <div className="flex justify-between items-center w-full">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-32 bg-muted/40 rounded" />
                            <Skeleton className="h-4 w-24 bg-muted/40 rounded" />
                        </div>
                        <Skeleton className="h-10 w-40 bg-muted/40 rounded" />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:gap-4">
                    {/* Sidebar Skeleton (Desktop) */}
                    <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
                        <div className="sticky top-20">
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 h-[calc(100vh-8rem)]">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Skeleton className="h-5 w-20 bg-muted/40 rounded" />
                                        <Skeleton className="h-10 w-full bg-muted/40 rounded" />
                                    </div>
                                    <div className="space-y-3">
                                        <Skeleton className="h-5 w-24 bg-muted/40 rounded" />
                                        <div className="space-y-2">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <Skeleton className="h-4 w-4 bg-muted/40 rounded" />
                                                    <Skeleton className="h-4 w-32 bg-muted/40 rounded" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Skeleton */}
                    <main className="flex-1 mt-4 lg:mt-0">
                        {/* Active Filters Skeleton */}
                        <div className="flex gap-2 mb-4 overflow-hidden">
                            <Skeleton className="h-8 w-24 bg-muted/40 rounded-full" />
                            <Skeleton className="h-8 w-32 bg-muted/40 rounded-full" />
                        </div>

                        {/* Product Grid Skeleton */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
                                <ProductCardSkeleton key={index} />
                            ))}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
