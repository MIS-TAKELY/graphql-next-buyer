import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'
import { ProductCardSkeleton } from '../home/ProductCardSkeleton'

const ProductPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-background relative pb-20 lg:pb-0">
      {/* Breadcrumb Skeleton */}
      <div className="container-custom py-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <div className="container-custom py-4 sm:py-6 lg:py-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[4.5fr_5.5fr] gap-8 xl:gap-12 mb-12">
          {/* LEFT COLUMN - Gallery Skeleton */}
          <div className="space-y-6 lg:sticky lg:top-24 h-fit self-start">
            <div className="space-y-4">
              <Skeleton className="aspect-square rounded-lg w-full" />
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded-lg flex-shrink-0" />
                ))}
              </div>
            </div>

            {/* Desktop Actions Skeleton */}
            <div className="hidden lg:flex gap-4">
              <Skeleton className="flex-1 h-12 rounded-lg" />
              <Skeleton className="flex-1 h-12 rounded-lg border border-primary/20" />
            </div>
          </div>

          {/* RIGHT COLUMN - Info Skeleton */}
          <div className="space-y-6">
            <div className="space-y-4">
              {/* Brand */}
              <Skeleton className="h-4 w-24" />
              {/* Title */}
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-2/3" />
              </div>

              {/* Rating and Stock */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-16 px-1.5 py-0.5 rounded" />
                <Skeleton className="h-5 w-24" />
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 pt-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>

              <Skeleton className="h-4 w-24" />
            </div>

            {/* Delivery and Seller Info Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              {/* Delivery Info */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3 border">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>

              {/* Seller Info */}
              <div className="border rounded-lg p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 space-y-8">
          {/* Reviews Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[0, 1].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Sections Skeletons */}
      {[0, 1].map((section) => (
        <div key={section} className="mt-12 container-custom">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-none w-[220px]">
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Mobile Actions Skeleton */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t p-3 flex gap-3 z-50">
        <Skeleton className="flex-1 h-12 rounded-lg" />
        <Skeleton className="flex-1 h-12 rounded-lg" />
      </div>
    </div>
  )
}

export default ProductPageSkeleton
