import { Badge } from "@/components/ui/badge";

interface SearchHeaderProps {
  query: string;
  filteredCount: number;
  totalResults: number;
}

export default function SearchHeader({ query, filteredCount, totalResults }: SearchHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
        Search Results
      </h1>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {filteredCount} of {totalResults.toLocaleString()} results for
        </span>
        <Badge variant="outline" className="font-normal">
          "{query}"
        </Badge>
      </div>
    </div>
  );
}