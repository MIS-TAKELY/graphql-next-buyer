import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const PlainProductCardSkeleton = () => {
    return (
        <div className="flex-shrink-0 w-40 xs:w-44 sm:w-48 md:w-52 lg:w-56 space-y-3">
            <Skeleton className="h-28 xs:h-32 sm:h-36 md:h-40 lg:h-44 w-full rounded-none bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="flex flex-col items-center gap-2 px-2">
                <Skeleton className="h-4 w-3/4 bg-muted/40" />
                <Skeleton className="h-3 w-1/2 bg-green-600/10" />
            </div>
        </div>
    );
};

export const LandingPageProductGridSkeleton = () => {
    return (
        <div className="w-full">
            <div className="border border-border p-3 md:p-4 bg-card shadow-sm">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-7 w-40 bg-muted/40" />
                    <Skeleton className="h-7 w-7 bg-primary/20" />
                </div>

                {/* Grid Skeletons */}
                <div className="grid grid-cols-2 gap-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center p-3 border border-border gap-2">
                            <Skeleton className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 bg-gray-200 dark:bg-gray-800" />
                            <Skeleton className="h-3 w-full bg-muted/40" />
                            <Skeleton className="h-3 w-2/3 bg-green-600/10" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
