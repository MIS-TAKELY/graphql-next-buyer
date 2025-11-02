import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductCardSkeleton() {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-4 flex gap-4">
        {/* Image Placeholder */}
        <Skeleton className="w-32 h-32 flex-shrink-0 rounded-lg" />

        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-4 mb-2">
            <div className="flex-1">
              {/* Product Name Placeholder */}
              <Skeleton className="h-5 w-3/4 mb-2" />
              {/* Rating Placeholder */}
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
            </div>
            {/* Price Placeholder */}
            <div className="text-right">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-16 mt-1" />
            </div>
          </div>

          {/* Description Placeholder */}
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-5/6 mb-1" />
          <Skeleton className="h-4 w-3/4 mb-3" />

          {/* Specs Placeholder */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="flex items-start gap-1">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>

          {/* Footer Placeholder */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-800">
            <Skeleton className="h-4 w-20" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}