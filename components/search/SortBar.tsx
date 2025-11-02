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
    <div className="mb-6 flex items-center justify-between gap-4">
      <Button
        variant="outline"
        onClick={() => setShowFilters(!showFilters)}
        className="lg:hidden"
      >
        <Filter className="w-4 h-4 mr-2" />
        Filters
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="ml-2 text-xs">
            {activeFiltersCount}
          </Badge>
        )}
      </Button>
      <div className="flex items-center gap-2 overflow-x-auto">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSortBy(option.value)}
            className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${
              sortBy === option.value
                ? "bg-blue-600 text-white"
                : "bg-gray-900 text-white hover:bg-gray-900 border border-gray-700"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
