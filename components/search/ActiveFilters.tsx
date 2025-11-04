import { X } from "lucide-react";

interface ActiveFiltersProps {
  dynamicFilters: { [key: string]: string[] };
  minRating: number;
  toggleFilter: (key: string, value: string) => void;
  setMinRating: (rating: number) => void;
  clearFilters: () => void;
  filterOptions: { [key: string]: string[] };
  dynamicSearchData: { category: string; filters: { key: string; label: string; type: string }[] } | null;
}

export default function ActiveFilters({
  dynamicFilters,
  minRating,
  toggleFilter,
  setMinRating,
  clearFilters,
  filterOptions,
  dynamicSearchData,
}: ActiveFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {Object.entries(dynamicFilters).map(([key, values]) =>
        values.map((value) => (
          <div
            key={`${key}-${value}`}
            className="flex items-center bg-gray-800 text-white px-3 py-1 rounded-full text-sm"
          >
            <span>
              {dynamicSearchData?.filters.find((f) => f.key === key)?.label || key}: {value}
            </span>
            <X
              className="ml-2 w-4 h-4 cursor-pointer"
              onClick={() => toggleFilter(key, value)}
            />
          </div>
        ))
      )}
      {minRating > 0 && (
        <div className="flex items-center bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
          <span>Rating: {minRating} & up</span>
          <X
            className="ml-2 w-4 h-4 cursor-pointer"
            onClick={() => setMinRating(0)}
          />
        </div>
      )}
      {Object.keys(dynamicFilters).length > 0 || minRating > 0 ? (
        <button
          onClick={clearFilters}
          className="text-sm text-blue-500 hover:underline"
        >
          Clear All
        </button>
      ) : null}
    </div>
  );
}