import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@radix-ui/react-label";
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

function DynamicFilter({ filterKey, label, options, selectedValues, toggleFilter }: DynamicFilterProps) {
  if (!options || options.length === 0) return null;

  return (
    <div>
      <h3 className="font-medium text-sm mb-3 text-gray-900 dark:text-white">{label}</h3>
      <div className="space-y-2">
        {options.map((option) => (
          <div
            key={option}
            className="flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded transition-colors"
            onClick={() => toggleFilter(filterKey, option)}
          >
            <Checkbox
              id={`${filterKey}-${option}`}
              checked={selectedValues.includes(option)}
              className="border-gray-300 dark:border-gray-600"
            />
            <Label
              htmlFor={`${filterKey}-${option}`}
              className="ml-2 text-sm cursor-pointer text-gray-700 dark:text-gray-300"
            >
              {option}
            </Label>
          </div>
        ))}
      </div>
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
    <aside className={`${showFilters ? "block" : "hidden"} lg:block w-64 flex-shrink-0`}>
      <div className="sticky top-6">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
            <PriceFilter priceRange={priceRange} setPriceRange={setPriceRange} />
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
      </div>
    </aside>
  );
}