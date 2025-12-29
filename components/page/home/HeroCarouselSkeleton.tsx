import { Skeleton } from "@/components/ui/skeleton";

export default function HeroCarouselSkeleton() {
    return (
        <div className="container-custom py-4 sm:py-6">
            <div className="relative aspect-[16/6] md:aspect-[21/7] lg:aspect-[16/4] w-full rounded-2xl overflow-hidden shadow-2xl">
                <Skeleton className="h-full w-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
            </div>
        </div>
    );
}
