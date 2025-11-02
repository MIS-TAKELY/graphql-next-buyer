import { Button } from "@/components/ui/button";

interface PaginationProps {
  filteredCount: number;
  totalResults: number;
}

export default function Pagination({
  filteredCount,
  totalResults,
}: PaginationProps) {
  return (
    <div className="mt-6 text-center">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Showing {filteredCount} of {totalResults.toLocaleString()} products
      </p>
      <Button variant="outline">Load More</Button>
    </div>
  );
}
