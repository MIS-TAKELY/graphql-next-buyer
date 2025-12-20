import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductCardSkeleton() {
  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden border">
      <CardContent className="p-0 flex w-full min-h-[140px] sm:min-h-[160px]">
        {/* LEFT: Image Section Skeleton */}
        <div className="relative w-[120px] xs:w-[140px] sm:w-[180px] md:w-[220px] shrink-0 bg-gray-50 dark:bg-gray-800/50 p-3 flex items-center justify-center">
          <Skeleton className="w-full h-full aspect-square md:aspect-[4/3] rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>

        {/* RIGHT: Content Section Skeleton */}
        <div className="flex-1 flex flex-col p-3 sm:p-5 relative">

          {/* Header: Brand & Rating Skeleton */}
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
            <Skeleton className="h-3 w-16 bg-muted/40 rounded animate-pulse" />

            <div className="flex items-center gap-1.5 shrink-0">
              <Skeleton className="h-4 w-10 bg-green-600/20 rounded animate-pulse px-1.5 py-0.5" />
              <Skeleton className="h-3 w-8 bg-muted/40 rounded animate-pulse hidden xs:inline-block" />
            </div>
          </div>

          {/* Title Skeleton */}
          <div className="space-y-1 mb-2">
            <Skeleton className="h-4 sm:h-5 w-full bg-muted/40 rounded animate-pulse" />
            <Skeleton className="h-4 sm:h-5 w-2/3 bg-muted/40 rounded animate-pulse" />
          </div>

          {/* Specs Skeleton - Desktop Only */}
          <div className="hidden md:flex flex-wrap gap-x-4 gap-y-1 mb-3">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <Skeleton className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                <Skeleton className="h-3 w-24 bg-muted/40 rounded" />
              </div>
            ))}
          </div>

          <div className="flex-1" />

          {/* Bottom Row: Price & Actions Skeleton */}
          <div className="flex items-end justify-between mt-2">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline gap-2">
                <Skeleton className="h-7 md:h-8 w-24 bg-muted/40 rounded" />
                <Skeleton className="h-4 w-16 bg-muted/40 rounded" />
              </div>
              <Skeleton className="h-3 w-28 bg-green-600/10 rounded" />
            </div>

            {/* Compare Checkbox Skeleton */}
            <div className="flex items-center gap-1.5 bg-white/50 dark:bg-black/20 p-1.5 rounded border border-border/10">
              <Skeleton className="h-3.5 w-3.5 rounded" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}