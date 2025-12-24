import CategorySectionSkeleton from "@/components/page/home/CategorySectionSkeleton";
import HeroCarouselSkeleton from "@/components/page/home/HeroCarouselSkeleton";
import { ProductCardSkeleton } from "@/components/page/home/ProductCardSkeleton";
import { PlainProductCardSkeleton, LandingPageProductGridSkeleton } from "@/components/landingPage/LandingPageSkeletons";

export default function HomeLoading() {
    return (
        <div className="bg-background text-foreground min-h-screen">
            {/* Category section - static, loads fast */}
            <CategorySectionSkeleton />

            {/* Hero carousel - static, loads fast */}
            <HeroCarouselSkeleton />

            {/* Main content skeleton */}
            <main className="bg-background pt-2 sm:pt-4 pb-4 sm:pb-8">
                <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-12">
                    {/* Category Swiper Skeletons (LandingPagrCategorySwiperWrapper) */}
                    {[...Array(3)].map((_, sectionIndex) => (
                        <section key={sectionIndex} className="container-custom">
                            <div className="flex justify-between items-center mb-6">
                                <div className="h-7 w-64 bg-secondary/20 rounded animate-pulse" />
                            </div>
                            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 scrollbar-hide">
                                {[...Array(8)].map((_, i) => (
                                    <PlainProductCardSkeleton key={i} />
                                ))}
                            </div>
                        </section>
                    ))}

                    {/* Product Grid Skeletons (LandingPageProductGridWrapper) */}
                    <div className="container-custom">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {[...Array(6)].map((_, gridIndex) => (
                                <LandingPageProductGridSkeleton key={gridIndex} />
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Product Sections Skeleton (ProductSection in HomePage) */}
            <div className="py-4 sm:py-6 md:py-8 lg:py-10">
                {/* Today's Best Deals - Horizontal */}
                <section className="mb-8 xs:mb-10 sm:mb-12 md:mb-16">
                    <div className="container-custom">
                        <div className="h-8 w-56 bg-secondary/20 rounded animate-pulse mb-4 sm:mb-6 px-1" />
                        <div className="flex gap-3 xs:gap-4 sm:gap-5 md:gap-6 overflow-x-auto pb-4 sm:pb-6 horizontal-scroll scrollbar-hide">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="flex-none w-[220px]">
                                    <ProductCardSkeleton />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Top Offers - Grid */}
                <section className="mb-8 xs:mb-10 sm:mb-12 md:mb-16">
                    <div className="container-custom">
                        <div className="h-8 w-48 bg-secondary/20 rounded animate-pulse mb-4 sm:mb-6 px-1" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                            {[...Array(6)].map((_, i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Recommended For You - Grid */}
                <section className="mb-8 xs:mb-10 sm:mb-12 md:mb-16">
                    <div className="container-custom">
                        <div className="h-8 w-64 bg-secondary/20 rounded animate-pulse mb-4 sm:mb-6 px-1" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                            {[...Array(12)].map((_, i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
