import { Badge } from "@/components/ui/badge";

interface SearchHeaderProps {
  query: string;
  filteredCount: number;
  totalResults: number;
}

export default function SearchHeader({ query, filteredCount, totalResults }: SearchHeaderProps) {
  return (
    <div className="mb-3"> {/* Reduced mb-4 to mb-3 */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1"> {/* text-xl to text-2xl, font-semibold to font-bold */}
        Search Results
      </h1>
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span className="shrink-0">
          {filteredCount} of {totalResults.toLocaleString()} results for
        </span>
        <Badge
          variant="outline"
          className="font-medium text-sm rounded-full px-3 max-w-[calc(100vw-32px)] sm:max-w-[400px] md:max-w-[600px] truncate block shrink-1"
        >
          "{query?.trim() || 'All Products'}"
        </Badge>
      </div>
    </div>
  );
} 