"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@radix-ui/react-label";
import { ChevronDown, ChevronUp } from "lucide-react"; // Import icons for toggle
import { useState } from "react";
import PriceFilter from "./PriceFilter";
import RatingFilter from "./RatingFilter";

interface FilterOption {
  value: string;
  count: number;
}

interface FilterSidebarProps {
  showFilters: boolean;
  selectedPriceRanges: string[];
  togglePriceRange: (range: string) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
  dynamicFilters: { [key: string]: string[] };
  toggleFilter: (key: string, value: string) => void;
  filterOptions: { [key: string]: string[] };
  dynamicSearchData: {
    category: string;
    intent?: Record<string, string[]>;
    filters: {
      key: string;
      label: string;
      options: FilterOption[] | string[] | null;
      type?: string
    }[];
  } | null;
}

interface DynamicFilterProps {
  filterKey: string;
  label: string;
  options: FilterOption[] | string[];
  selectedValues: string[];
  toggleFilter: (key: string, value: string) => void;
  type?: string;
}

function DynamicFilter({
  filterKey,
  label,
  options,
  selectedValues,
  toggleFilter,
  type,
}: DynamicFilterProps) {
  // State to manage collapse/expand for collapsible filters
  const [isExpanded, setIsExpanded] = useState(
    // Always expanded for Price, Rating, Brand and AI suggested filters
    ["price", "rating", "brand"].includes(filterKey.toLowerCase()) || type === "suggested"
  );

  if (!options || options.length === 0) return null;

  // Determine if the filter should be collapsible
  const isCollapsible = !["price", "rating", "brand"].includes(
    filterKey.toLowerCase()
  );

  const isSuggested = type === "suggested";

  // Normalize options to FilterOption format
  const normalizedOptions: FilterOption[] = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, count: 0 };
    }
    return opt;
  });

  return (
    <div className={`border-b border-gray-200 dark:border-gray-800 pb-2 ${isSuggested ? 'bg-blue-50/30 dark:bg-blue-900/10 -mx-2 px-2 rounded-lg' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-2">
            {label}
          </h3>
        </div>
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
          {normalizedOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded"
              onClick={() => toggleFilter(filterKey, option.value)}
            >
              <div className="flex items-center flex-1">
                <Checkbox
                  id={`${filterKey}-${option.value}`}
                  checked={selectedValues.includes(option.value)}
                  className="border-gray-300 dark:border-gray-600"
                />
                <Label
                  htmlFor={`${filterKey}-${option.value}`}
                  className="ml-2 text-xs cursor-pointer text-gray-700 dark:text-gray-300"
                >
                  {option.value}
                </Label>
              </div>
              {option.count > 0 && (
                <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-2">
                  ({option.count})
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FilterSidebar({
  showFilters,
  selectedPriceRanges,
  togglePriceRange,
  minRating,
  setMinRating,
  dynamicFilters,
  toggleFilter,
  filterOptions,
  dynamicSearchData,
}: FilterSidebarProps) {
  const isLoading = !dynamicSearchData && !dynamicSearchData; // This is a bit simplified, usually passed via prop

  return (
    <div
      className={`${showFilters ? "block" : "hidden"
        } lg:block w-full`}
    >
      <div className="space-y-4">
        <PriceFilter
          selectedPriceRanges={selectedPriceRanges}
          togglePriceRange={togglePriceRange}
        />
        <RatingFilter minRating={minRating} setMinRating={setMinRating} />

        {/* Dynamic / AI Filters */}
        {dynamicSearchData?.filters ? (
          dynamicSearchData.filters.map((filter) => (
            <DynamicFilter
              key={filter.key}
              filterKey={filter.key}
              label={filter.label}
              options={filterOptions[filter.key] || filter.options || []}
              selectedValues={dynamicFilters[filter.key] || []}
              toggleFilter={toggleFilter}
              type={filter.type}
            />
          ))
        ) : (
          // Skeleton loaders for filters
          <div className="space-y-6 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="space-y-1">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                      <div className="h-3 w-full bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

