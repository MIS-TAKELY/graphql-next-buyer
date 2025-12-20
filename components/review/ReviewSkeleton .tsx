import { Skeleton } from "@/components/ui/skeleton";

const ReviewSkeleton = () => {
    return (
        <div className="py-4 border-b border-border last:border-0">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                    {/* Rating Badge Skeleton */}
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-12 rounded bg-muted/40" />
                        <Skeleton className="h-4 w-20 bg-muted/40" />
                    </div>

                    {/* Comment Skeleton */}
                    <div className="space-y-2 pt-1">
                        <Skeleton className="h-4 w-full bg-muted/20" />
                        <Skeleton className="h-4 w-5/6 bg-muted/20" />
                    </div>

                    {/* Media Skeleton */}
                    <div className="flex gap-2 mt-3">
                        {[...Array(2)].map((_, i) => (
                            <Skeleton key={i} className="w-16 h-16 rounded-md bg-muted/30" />
                        ))}
                    </div>

                    {/* Footer Skeleton */}
                    <div className="flex items-center gap-4 pt-2">
                        <Skeleton className="h-3 w-24 bg-muted/20" />
                        <div className="flex items-center gap-1">
                            <Skeleton className="h-3 w-3 bg-muted/20 rounded-full" />
                            <Skeleton className="h-3 w-20 bg-muted/20" />
                        </div>
                        <Skeleton className="h-3 w-16 bg-muted/20" />

                        <div className="ml-auto flex items-center gap-1">
                            <Skeleton className="h-4 w-4 bg-muted/20" />
                            <Skeleton className="h-4 w-8 bg-muted/20" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewSkeleton;
