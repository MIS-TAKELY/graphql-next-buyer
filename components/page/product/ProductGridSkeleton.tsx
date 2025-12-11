import SkeletonProductCard from "@/components/page/home/SkeletonProductCard";

interface ProductGridSkeletonProps {
    count?: number;
    columns?: "search" | "category";
}

export default function ProductGridSkeleton({
    count = 6,
    columns = "category",
}: ProductGridSkeletonProps) {
    const gridClass =
        columns === "search"
            ? "grid grid-cols-1 gap-4"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

    return (
        <div className={gridClass}>
            {[...Array(count)].map((_, i) => (
                <SkeletonProductCard key={i} />
            ))}
        </div>
    );
}
