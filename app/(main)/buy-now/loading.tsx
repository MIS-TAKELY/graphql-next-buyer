export default function BuyNowLoading() {
    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900">
            {/* Header Skeleton */}
            <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6" />

            {/* Steps Skeleton */}
            <div className="h-4 w-full max-w-2xl bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8 mx-auto" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Address/Payment Skeleton */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="h-64 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-100 dark:border-gray-700 space-y-6">
                        <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="h-24 bg-gray-100 dark:bg-gray-700/50 rounded animate-pulse" />
                            <div className="h-24 bg-gray-100 dark:bg-gray-700/50 rounded animate-pulse" />
                        </div>
                    </div>
                    <div className="h-48 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-100 dark:border-gray-700">
                        <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
                        <div className="space-y-3">
                            <div className="h-10 bg-gray-100 dark:bg-gray-700/50 rounded animate-pulse" />
                            <div className="h-10 bg-gray-100 dark:bg-gray-700/50 rounded animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Right Side: Order Summary Skeleton */}
                <div className="lg:col-span-1">
                    <div className="h-80 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-100 dark:border-gray-700 space-y-4">
                        <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="space-y-3 pt-4">
                            <div className="flex justify-between">
                                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                            <div className="flex justify-between">
                                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between">
                                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="pt-6">
                            <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
