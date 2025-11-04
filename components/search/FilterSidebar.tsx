// FilterSidebar.tsx
import { Card, CardContent } from "@/components/ui/card";
import PriceFilter from "./PriceFilter";
import BrandFilter from "./BrandFilter";
import CategoryFilter from "./CategoryFilter";
import RatingFilter from "./RatingFilter";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@radix-ui/react-label";

interface FilterSidebarProps {
  showFilters: boolean;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  selectedCategories: string[];
  toggleCategory: (category: string) => void;
  selectedBrands: string[];
  toggleBrand: (brand: string) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
  categories: string[];
  brands: string[];
  dynamicFilters: { [key: string]: string[] };
  toggleFilter: (key: string, value: string) => void;
  filterOptions: { [key: string]: string[] };
  dynamicSearchData: { category: string; filters: { key: string; label: string; options: string[] }[] } | null;
}

interface DynamicFilterProps {
  filterKey: string;
  label: string;
  options: string[];
  selectedValues: string[];
  toggleFilter: (key: string, value: string) => void;
}

function DynamicFilter({ filterKey, label, options, selectedValues, toggleFilter }: DynamicFilterProps) {
  return (
    <div>
      <h3 className="font-medium text-sm mb-3 text-white">{label}</h3>
      <div className="space-y-2">
        {options?.map((option) => (
          <div
            key={option}
            className="flex items-center cursor-pointer hover:bg-gray-900 p-1 rounded transition-colors"
            onClick={() => toggleFilter(filterKey, option)}
          >
            <Checkbox
              id={`${filterKey}-${option}`}
              checked={selectedValues.includes(option)}
              className="border-gray-600"
            />
            <Label
              htmlFor={`${filterKey}-${option}`}
              className="ml-2 text-sm cursor-pointer text-gray-300"
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
  selectedCategories,
  toggleCategory,
  selectedBrands,
  toggleBrand,
  minRating,
  setMinRating,
  categories,
  brands,
  dynamicFilters,
  toggleFilter,
  filterOptions,
  dynamicSearchData,
}: FilterSidebarProps) {
  return (
    <aside className={`${showFilters ? "block" : "hidden"} lg:block w-64 flex-shrink-0`}>
      <div className="sticky top-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
            <PriceFilter priceRange={priceRange} setPriceRange={setPriceRange} />
            <CategoryFilter
              categories={categories}
              selectedCategories={selectedCategories}
              toggleCategory={toggleCategory}
            />
            <BrandFilter
              brands={brands}
              selectedBrands={selectedBrands}
              toggleBrand={toggleBrand}
            />
            <RatingFilter minRating={minRating} setMinRating={setMinRating} />
            {dynamicSearchData?.filters
              ?.filter((filter) => !["brand", "category"].includes(filter.key))
              .map((filter) => (
                <DynamicFilter
                  key={filter.key}
                  filterKey={filter.key}
                  label={filter.label}
                  options={filterOptions[filter.key] || filter.options}
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
