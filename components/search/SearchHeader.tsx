import { Badge } from "@/components/ui/badge";

interface SearchHeaderProps {
  query: string;
  filteredCount: number;
  totalResults: number;
}

export default function SearchHeader({ query, filteredCount, totalResults }: SearchHeaderProps) {
  return (
    <div className="mb-4">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
        Search Results
      </h1>
      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
        <span>
          {filteredCount} of {totalResults.toLocaleString()} results for
        </span>
        <Badge variant="outline" className="font-normal text-xs">
          "{query}"
        </Badge>
      </div>
    </div>
  );
}