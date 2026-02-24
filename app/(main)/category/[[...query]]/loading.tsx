
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
                    </div>
                </div>

                {/* Main Content Skeleton */}
                <main className="flex-1 mt-4">
                    {/* Product Grid Skeleton */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                            <ProductCardSkeleton key={index} />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
