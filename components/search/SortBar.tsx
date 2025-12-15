import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface SortBarProps {
  sortBy: string;
  setSortBy: (sort: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  activeFiltersCount: number;
}

export default function SortBar({
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
  activeFiltersCount,
}: SortBarProps) {
  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "popularity", label: "Popularity" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "newest", label: "Newest" },
    { value: "rating", label: "Rating" },
  ];

  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <Button
        variant="outline"
        onClick={() => setShowFilters(!showFilters)}
        className="lg:hidden p-2 text-xs"
      >
        <Filter className="w-3 h-3 mr-1" />
        Filters
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="ml-1 text-xs">
            {activeFiltersCount}
          </Badge>
        )}
      </Button>
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSortBy(option.value)}
            className={`px-2 py-1 rounded-md text-xs whitespace-nowrap transition-colors ${sortBy === option.value
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700"
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}