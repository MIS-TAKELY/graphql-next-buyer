import { Badge } from "@/components/ui/badge";

interface SearchHeaderProps {
  query: string;
  filteredCount: number;
  totalResults: number;
}

export default function SearchHeader({ query, filteredCount, totalResults }: SearchHeaderProps) {
  return (
    <div className="mb-2 lg:mb-4">
      <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1">
        Search Results
      </h1>
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        <span className="shrink-0">
          {filteredCount} of {totalResults.toLocaleString()} results for
        </span>
        <Badge
          variant="secondary"
          className="font-medium text-[10px] sm:text-sm rounded-full px-2 sm:px-3 max-w-[calc(100vw-32px)] sm:max-w-[400px] md:max-w-[600px] truncate block shrink-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-none"
        >
          "{query?.trim() || 'All Products'}"
        </Badge>
      </div>
    </div>
  );
} 