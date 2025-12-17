import { X } from "lucide-react";

interface ActiveFiltersProps {
  dynamicFilters: { [key: string]: string[] };
  minRating: number;
  toggleFilter: (key: string, value: string) => void;
  setMinRating: (rating: number) => void;
  clearFilters: () => void;
  filterOptions: { [key: string]: string[] };
  selectedPriceRanges: string[];
  togglePriceRange: (range: string) => void;
  dynamicSearchData: { category: string; filters: { key: string; label: string; type: string }[] } | null;
}

export default function ActiveFilters({
  dynamicFilters,
  minRating,
  toggleFilter,
  setMinRating,
  clearFilters,
  filterOptions,
  selectedPriceRanges,
  togglePriceRange,
  dynamicSearchData,
}: ActiveFiltersProps) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {Object.entries(dynamicFilters).map(([key, values]) =>
        values.map((value) => (
          <div
            key={`${key}-${value}`}
            className="flex items-center bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-0.5 rounded-full text-xs"
          >
            <span>
              {dynamicSearchData?.filters.find((f) => f.key === key)?.label || key}: {value}
            </span>
            <X
              className="ml-1 w-3 h-3 cursor-pointer hover:text-red-500"
              onClick={() => toggleFilter(key, value)}
            />
          </div>
        ))
      )}
      {minRating > 0 && (
        <div className="flex items-center bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-0.5 rounded-full text-xs">
          <span>Rating: {minRating} & up</span>
          <X
            className="ml-1 w-3 h-3 cursor-pointer hover:text-red-500"
            onClick={() => setMinRating(0)}
          />
        </div>
      )}
      {Object.keys(dynamicFilters).length > 0 || minRating > 0 || selectedPriceRanges.length > 0 ? (
        <button
          onClick={clearFilters}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Clear All
        </button>
      ) : null}
    </div>
  );
}