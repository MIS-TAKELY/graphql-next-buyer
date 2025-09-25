"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrderItemSkeleton() {
  return (
    <Card className="border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>

          {/* Right side */}
          <div className="text-right">
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end mt-3 space-x-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
