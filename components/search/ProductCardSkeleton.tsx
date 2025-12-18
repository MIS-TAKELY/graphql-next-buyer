import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductCardSkeleton() {
  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardContent className="p-3 sm:p-4 flex gap-3 sm:gap-4">
        {/* Image Placeholder - Responsive width matches ProductCard */}
        <Skeleton className="w-[120px] xs:w-[140px] sm:w-[180px] md:w-[220px] aspect-square md:aspect-[4/3] flex-shrink-0 rounded-lg bg-gray-200 dark:bg-gray-700" />

        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-2 sm:gap-4 mb-2">
            <div className="flex-1">
              {/* Product Name Placeholder */}
              <Skeleton className="h-4 sm:h-5 w-3/4 mb-2 bg-gray-200 dark:bg-gray-700" />
              {/* Rating Placeholder */}
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="h-4 w-10 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>

          {/* Description Placeholder - Hidden on mobile */}
          <div className="hidden md:block">
            <Skeleton className="h-4 w-full mb-1 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-4 w-5/6 mb-1 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-4 w-3/4 mb-3 bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Specs Placeholder - Hidden on mobile */}
          <div className="hidden md:grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="flex items-start gap-1">
                <Skeleton className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>

          <div className="flex items-end justify-between mt-auto pt-2">
            <div>
              <Skeleton className="h-6 w-24 bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-3 w-16 mt-1 bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="hidden xs:block">
              <Skeleton className="h-4 w-16 bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}