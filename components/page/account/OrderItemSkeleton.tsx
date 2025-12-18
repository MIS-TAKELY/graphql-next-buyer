"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrderItemSkeleton() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center p-4 gap-4">
          {/* Thumbnail Skeleton */}
          <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg shrink-0" />

          {/* Info Section Skeleton */}
          <div className="flex-1 space-y-3 py-1">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                {/* Order Number */}
                <Skeleton className="h-5 w-3/4 sm:w-1/2" />
                {/* Date */}
                <Skeleton className="h-3 w-24" />
              </div>
              {/* Status Badge */}
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>

            <div className="flex items-center justify-between mt-auto">
              {/* Price */}
              <Skeleton className="h-5 w-20" />
              {/* Details link */}
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
