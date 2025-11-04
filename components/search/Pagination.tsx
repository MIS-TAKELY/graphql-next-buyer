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
    <div className="mt-4 text-center">
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        Showing {filteredCount} of {totalResults.toLocaleString()} products
      </p>
      <Button variant="outline" className="text-xs">
        Load More
      </Button>
    </div>
  );
}
