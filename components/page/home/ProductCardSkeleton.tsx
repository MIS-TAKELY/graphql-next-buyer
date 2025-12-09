import { Card, CardContent } from "@/components/ui/card";

// Add this in your ProductCardSkeleton file
export const ProductCardSkeleton = () => {
  return (
    <Card className="h-full bg-card border border-border/20 shadow-sm rounded-none overflow-hidden">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Image skeleton - Aspect Ratio 4/5 */}
        <div className="aspect-[4/5] w-full bg-secondary/30 animate-pulse relative">
          <div className="absolute top-2 left-2 w-16 h-5 bg-muted/40 rounded-full" />
        </div>

        <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2">
          {/* Title skeleton */}
          <div className="h-4 sm:h-5 bg-muted/40 rounded w-3/4 animate-pulse" />

          {/* Rating skeleton */}
          <div className="flex items-center gap-1 my-1">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-3 h-3 bg-muted/40 rounded-full" />
              ))}
            </div>
            <div className="h-3 w-8 bg-muted/40 rounded ml-2 animate-pulse" />
          </div>

          {/* Price skeleton */}
          <div className="flex items-baseline gap-2 mt-auto">
            <div className="h-5 sm:h-6 w-20 bg-muted/40 rounded animate-pulse" />
            <div className="h-4 w-12 bg-muted/30 rounded animate-pulse" />
          </div>
        </div>

        {/* Add to Cart Button Skeleton */}
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 mt-2">
          <div className="h-9 sm:h-10 w-full bg-primary/20 rounded-lg animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
};