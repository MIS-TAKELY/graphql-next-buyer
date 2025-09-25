// components/page/buy-now/BuyNowSkeleton.tsx
"use client";

export function BuyNowSkeleton() {
  return (
    <div className="max-w-[1800px] mx-auto px-4 py-6 animate-pulse bg-gray-50 dark:bg-gray-900">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="ml-auto h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      {/* Steps skeleton */}
      <div className="flex justify-center gap-8 mb-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            {i < 1 && <div className="w-16 h-0.5 bg-gray-200 dark:bg-gray-700"></div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left content skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>

        {/* Sidebar skeleton */}
        <div className="lg:col-span-1">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}