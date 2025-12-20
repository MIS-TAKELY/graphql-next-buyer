import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ReviewSkeleton = () => {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {/* User info row */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-20 h-3" />
          </div>
        </div>

        {/* Comment block */}
        <Skeleton className="w-full h-16" />

        {/* Media preview (optional row) */}
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="w-20 h-20 rounded-lg" />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t">
          <Skeleton className="w-24 h-6" />
          <Skeleton className="w-24 h-6" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewSkeleton;
