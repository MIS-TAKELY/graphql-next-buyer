import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";

const WishlistSkeleton = () => {
  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Heart className="h-5 w-5 text-pink-500/50 fill-current" />
            My Wishlist
          </CardTitle>
          <Skeleton className="h-6 w-16 bg-muted/40" />
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <div className="divide-y divide-border">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row gap-4 p-4 sm:p-6"
            >
              <div className="flex gap-4 flex-1">
                {/* Image Skeleton */}
                <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg flex-shrink-0" />

                {/* Details Skeleton */}
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>

              {/* Actions Skeleton */}
              <div className="flex flex-row sm:flex-col gap-2 sm:justify-center ml-0 sm:ml-4">
                <Skeleton className="h-10 w-full sm:w-32" />
                <Skeleton className="h-10 w-full sm:w-32" />
                <Skeleton className="h-10 w-full sm:w-10" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WishlistSkeleton;
