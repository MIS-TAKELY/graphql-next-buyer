import { Card, CardContent } from "@/components/ui/card";

// Add this in your ProductCardSkeleton file
export const ProductCardSkeleton = () => {
  return (
    <Card className="h-full bg-card border-gray-200 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden min-h-[320px]">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Image skeleton - Aspect Ratio 4/3 */}
        <div className="aspect-[4/3] w-full bg-secondary/30 animate-pulse relative">
        </div>

        <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2">
          {/* Title skeleton */}
          <div className="h-4 bg-muted/40 rounded w-3/4 animate-pulse" />

          {/* Rating skeleton */}
          <div className="flex items-center gap-1 my-1">
            <div className="h-4 w-10 bg-muted/40 rounded animate-pulse" />
          </div>

          <div className="flex-1" />

          {/* Price skeleton */}
          <div className="flex items-baseline gap-2 mt-2">
            <div className="h-6 w-24 bg-muted/40 rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};