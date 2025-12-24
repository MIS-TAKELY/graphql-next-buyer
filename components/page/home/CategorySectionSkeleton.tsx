import { Skeleton } from "@/components/ui/skeleton";

export default function CategorySectionSkeleton() {
    return (
        <section className="bg transition-colors duration-300 w-full mb-6">
            <div className="container-custom">
                <div className="bg-card w-full">
                    {/* Scrollable container for mobile, grid for lg+ */}
                    <div className="overflow-x-auto lg:overflow-x-visible scrollbar-hide lg:scrollbar-auto">
                        <div
                            className="
                flex lg:grid lg:grid-cols-[repeat(auto-fit,minmax(80px,1fr))]
                gap-2 xs:gap-3 sm:gap-4 md:gap-3 lg:gap-2 xl:gap-3 2xl:gap-4
                pb-2 xs:pb-2 sm:pb-3 md:pb-4
                px-2 xs:px-3 sm:px-4 md:px-0
              "
                        >
                            {[...Array(10)].map((_, index) => (
                                <div key={index} className="flex flex-col items-center justify-center gap-2 flex-shrink-0 lg:flex-shrink w-20 xs:w-24 sm:w-28 md:w-24 lg:w-full">
                                    <Skeleton
                                        className="
                      w-12 xs:w-14 sm:w-16 md:w-14 lg:w-16 xl:w-18
                      h-12 xs:h-14 sm:h-16 md:h-14 lg:h-16 xl:h-18
                      rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse
                    "
                                    />
                                    <Skeleton className="h-3 w-12 bg-gray-200 dark:bg-gray-800 animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
