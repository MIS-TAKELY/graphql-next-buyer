import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

interface SortBarProps {
  sortBy: string;
  setSortBy: (sort: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  activeFiltersCount: number;
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
}

export default function SortBar({
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
  activeFiltersCount,
  itemsPerPage,
  setItemsPerPage,
}: SortBarProps) {
  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "popularity", label: "Popularity" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "newest", label: "Newest" },
    { value: "rating", label: "Rating" },
  ];

  const itemsPerPageOptions = [10, 20, 50, 100];

  return (
    <div className="sticky top-[48px] sm:top-[56px] md:top-[64px] lg:relative lg:top-auto z-30 -mx-4 px-4 py-2 sm:px-0 sm:py-3 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-md lg:bg-transparent lg:backdrop-blur-none border-b lg:border-none border-gray-200 dark:border-gray-800 lg:mb-4 transition-all duration-300">
      <div className="flex flex-row items-center justify-between gap-2 max-w-full">
        {/* Mobile Filter Button */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden h-9 px-3 text-xs flex-shrink-0 bg-white dark:bg-gray-800"
        >
          <Filter className="w-3.5 h-3.5 mr-1.5" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1.5 h-4.5 min-w-[18px] px-1 text-[10px] bg-blue-600 text-white border-none">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        <div className="flex items-center gap-2 flex-1 justify-end">
          {/* Sorting Dropdown - Visible on mobile/tablet, hidden on large desktops if we want buttons there, but let's use Select everywhere for consistency if it looks better */}
          <div className="flex items-center gap-2">
            <span className="hidden xs:inline text-xs text-muted-foreground whitespace-nowrap">Sort:</span>
            <Select
              value={sortBy}
              onValueChange={setSortBy}
            >
              <SelectTrigger className="h-9 w-[130px] sm:w-[160px] text-xs bg-white dark:bg-gray-800">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items Per Page - Compact on mobile */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-muted-foreground whitespace-nowrap">Show:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger className="h-9 w-[65px] text-xs bg-white dark:bg-gray-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()} className="text-xs">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}