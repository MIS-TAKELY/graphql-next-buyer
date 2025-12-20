import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProductCardSkeleton = () => {
  return (
    <div className="block w-full h-full relative">
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden min-h-[320px] h-full flex flex-col">
        <CardContent className="p-0 flex flex-col h-full">
          {/* Image skeleton - Aspect Ratio 4/3 */}
          <div className="aspect-[4/3] w-full bg-gray-50 dark:bg-gray-800 animate-pulse relative" />

          {/* Details Section */}
          <div className="p-3 sm:p-4 flex flex-col flex-1 gap-1.5">
            {/* Brand skeleton */}
            <Skeleton className="h-3 w-16 bg-muted/40 rounded animate-pulse" />

            {/* Title skeleton */}
            <div className="space-y-1">
              <Skeleton className="h-4 w-full bg-muted/40 rounded animate-pulse" />
              <Skeleton className="h-4 w-2/3 bg-muted/40 rounded animate-pulse" />
            </div>

            {/* Rating skeleton */}
            <div className="flex items-center gap-1.5 mt-1">
              <Skeleton className="h-4 w-10 bg-green-600/20 rounded animate-pulse px-1.5 py-0.5" />
              <Skeleton className="h-3 w-8 bg-muted/40 rounded animate-pulse" />
            </div>

            <div className="flex-1" />

            {/* Price skeleton */}
            <div className="flex items-baseline gap-2 mt-2">
              <Skeleton className="h-6 w-20 bg-muted/40 rounded animate-pulse" />
              <Skeleton className="h-4 w-12 bg-muted/40 rounded animate-pulse" />
            </div>

            {/* Delivery skeleton */}
            <Skeleton className="h-3 w-24 bg-green-600/10 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>

      {/* Compare Checkbox Skeleton */}
      <div className="absolute bottom-3 right-3 z-10">
        <div className="flex items-center gap-1.5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded border border-border px-2 py-1.5">
          <Skeleton className="h-3.5 w-3.5 rounded" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
};