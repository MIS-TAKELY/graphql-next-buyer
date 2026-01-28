"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@radix-ui/react-label";
import { ChevronDown, ChevronUp } from "lucide-react"; // Import icons for toggle
import { useState } from "react";
import PriceFilter from "./PriceFilter";
import RatingFilter from "./RatingFilter";

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
    filters: { key: string; label: string; options: string[] | null; type?: string }[];
  } | null;
}

interface DynamicFilterProps {
  filterKey: string;
  label: string;
  options: string[];
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

  return (
    <div className={`border-b border-gray-200 dark:border-gray-800 pb-2 ${isSuggested ? 'bg-blue-50/30 dark:bg-blue-900/10 -mx-2 px-2 rounded-lg' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-2">
            {label}
          </h3>
          {isSuggested && (
            <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1 rounded font-bold uppercase tracking-wider mb-2">
              AI
            </span>
          )}
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
  selectedPriceRanges,
  togglePriceRange,
  minRating,
  setMinRating,
  dynamicFilters,
  toggleFilter,
  filterOptions,
  dynamicSearchData,
}: FilterSidebarProps) {
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
        {dynamicSearchData?.filters?.map((filter) => (
          <DynamicFilter
            key={filter.key}
            filterKey={filter.key}
            label={filter.label}
            options={filterOptions[filter.key] || filter.options || []}
            selectedValues={dynamicFilters[filter.key] || []}
            toggleFilter={toggleFilter}
            type={filter.type}
          />
        ))}
      </div>
    </div>
  );
}
