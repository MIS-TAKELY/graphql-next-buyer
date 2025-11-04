import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@radix-ui/react-label";
import { ChevronDown, ChevronUp } from "lucide-react"; // Import icons for toggle
import { useState } from "react";
import PriceFilter from "./PriceFilter";
import RatingFilter from "./RatingFilter";

interface FilterSidebarProps {
  showFilters: boolean;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
  dynamicFilters: { [key: string]: string[] };
  toggleFilter: (key: string, value: string) => void;
  filterOptions: { [key: string]: string[] };
  dynamicSearchData: {
    category: string;
    filters: { key: string; label: string; options: string[] | null }[];
  } | null;
}

interface DynamicFilterProps {
  filterKey: string;
  label: string;
  options: string[];
  selectedValues: string[];
  toggleFilter: (key: string, value: string) => void;
}

function DynamicFilter({
  filterKey,
  label,
  options,
  selectedValues,
  toggleFilter,
}: DynamicFilterProps) {
  // State to manage collapse/expand for collapsible filters
  const [isExpanded, setIsExpanded] = useState(
    // Always expanded for Price, Rating, and Brand
    ["price", "rating", "brand"].includes(filterKey.toLowerCase())
  );

  if (!options || options.length === 0) return null;

  // Determine if the filter should be collapsible
  const isCollapsible = !["price", "rating", "brand"].includes(
    filterKey.toLowerCase()
  );

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 pb-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-2">
          {label}
        </h3>
        {isCollapsible && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 dark:text-gray-400 focus:outline-none"
            aria-label={isExpanded ? `Collapse ${label}` : `Expand ${label}`}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      {isExpanded && (
        <div className="space-y-1">
          {options.map((option) => (
            <div
              key={option}
              className="flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded"
              onClick={() => toggleFilter(filterKey, option)}
            >
              <Checkbox
                id={`${filterKey}-${option}`}
                checked={selectedValues.includes(option)}
                className="border-gray-300 dark:border-gray-600"
              />
              <Label
                htmlFor={`${filterKey}-${option}`}
                className="ml-2 text-xs cursor-pointer text-gray-700 dark:text-gray-300"
              >
                {option}
              </Label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FilterSidebar({
  showFilters,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  dynamicFilters,
  toggleFilter,
  filterOptions,
  dynamicSearchData,
}: FilterSidebarProps) {
  return (
    <aside
      className={`${
        showFilters ? "block" : "hidden"
      } lg:block w-full`}
    >
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-4 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <PriceFilter
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />
          <RatingFilter minRating={minRating} setMinRating={setMinRating} />
          {dynamicSearchData?.filters?.map((filter) => (
            <DynamicFilter
              key={filter.key}
              filterKey={filter.key}
              label={filter.label}
              options={filterOptions[filter.key] || filter.options || []}
              selectedValues={dynamicFilters[filter.key] || []}
              toggleFilter={toggleFilter}
            />
          ))}
        </CardContent>
      </Card>
    </aside>
  );
}
