import { Skeleton } from "@/components/ui/skeleton";

export default function HeroCarouselSkeleton() {
    return (
        <div className="container-custom py-4 sm:py-6">
            <div className="relative h-[250px] sm:h-[400px] md:h-[500px] lg:h-[300px] w-full rounded-2xl overflow-hidden shadow-2xl">
                <Skeleton className="h-full w-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
            </div>
        </div>
    );
}
