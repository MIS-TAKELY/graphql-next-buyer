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
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"> {/* text-xs to text-sm */}
        <span>
          {filteredCount} of {totalResults.toLocaleString()} results for
        </span>
        {/* <Badge variant="outline" className="font-medium text-sm rounded-full px-3 max-w-[150px] sm:max-w-md truncate align-bottom"> */}
        <Badge variant="outline" className="font-medium text-sm rounded-full px-3 max-w-full flex-1  line-clamp-1"> {/* font-normal to font-medium, text-xs to text-sm, added rounded-full px-3 */}
          "{query}"
        </Badge>
      </div>
    </div>
  );
} 