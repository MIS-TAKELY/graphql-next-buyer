"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrderItemSkeleton() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center p-4 gap-4">
          {/* Thumbnail Skeleton */}
          <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg shrink-0 bg-muted/40" />

          {/* Info Section Skeleton */}
          <div className="flex-1 space-y-3 py-1 flex flex-col justify-between self-stretch">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                {/* Order Number */}
                <Skeleton className="h-5 w-3/4 sm:w-1/2 bg-muted/40" />
                {/* Date */}
                <div className="flex items-center gap-1">
                  <Skeleton className="h-3 w-3 bg-muted/20 rounded-full" />
                  <Skeleton className="h-3 w-24 bg-muted/20" />
                </div>
              </div>
              {/* Status Badge */}
              <Skeleton className="h-5 w-20 rounded-full bg-muted/30" />
            </div>

            <div className="flex items-center justify-between mt-auto">
              {/* Price */}
              <Skeleton className="h-6 w-24 bg-muted/40" />
              {/* Details link placeholder */}
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-10 bg-primary/10" />
                <Skeleton className="h-3 w-3 bg-primary/10 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
