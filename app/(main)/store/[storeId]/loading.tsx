
import { ProductCardSkeleton } from "@/components/page/home/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function Loading() {
    return (
        <div className="container-custom py-8 min-h-screen">
            <div className="mb-6 flex items-center gap-4">
                <Link href="/">
                    <Button variant="ghost" size="icon" disabled>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48 bg-muted/40 rounded animate-pulse" />
                    <Skeleton className="h-4 w-24 bg-muted/40 rounded animate-pulse" />
                </div>
            </div>

            <div className="space-y-10">
                {[1, 2].map((categoryIndex) => (
                    <div key={categoryIndex}>
                        <Skeleton className="h-7 w-40 mb-4 bg-muted/40 rounded animate-pulse" />
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {[1, 2, 3, 4, 5].map((index) => (
                                <ProductCardSkeleton key={index} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
