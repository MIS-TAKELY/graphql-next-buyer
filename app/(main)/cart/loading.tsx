export default function CartLoading() {
    return (
        <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 bg-gray-50 dark:bg-gray-900">
            {/* Header Skeleton */}
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Items Skeleton */}
                <div className="lg:col-span-2 space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-40 bg-white dark:bg-gray-800 rounded-lg p-4 flex gap-4 border border-gray-100 dark:border-gray-700">
                            <div className="h-32 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="flex-1 space-y-3">
                                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-4" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary Skeleton */}
                <div className="lg:col-span-1">
                    <div className="h-64 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-100 dark:border-gray-700 space-y-4">
                        <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
