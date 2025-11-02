import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Badge } from "../ui/badge";

interface ActiveFiltersProps {
  selectedCategories: string[];
  selectedBrands: string[];
  selectedNetworks: string[];
  minRating: number;
  toggleCategory: (category: string) => void;
  toggleBrand: (brand: string) => void;
  toggleNetwork: (network: string) => void;
  setMinRating: (rating: number) => void;
  clearFilters: () => void;
}

export default function ActiveFilters({
  selectedCategories,
  selectedBrands,
  selectedNetworks,
  minRating,
  toggleCategory,
  toggleBrand,
  toggleNetwork,
  setMinRating,
  clearFilters,
}: ActiveFiltersProps) {
  const activeFiltersCount =
    selectedCategories.length +
    selectedBrands.length +
    selectedNetworks.length +
    (minRating > 0 ? 1 : 0);

  if (activeFiltersCount === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {selectedCategories.map((cat) => (
        <Badge
          key={cat}
          variant="secondary"
          className="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
          onClick={() => toggleCategory(cat)}
        >
          {cat}
          <X className="w-3 h-3 ml-1" />
        </Badge>
      ))}
      {selectedBrands.map((brand) => (
        <Badge
          key={brand}
          variant="secondary"
          className="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
          onClick={() => toggleBrand(brand)}
        >
          {brand}
          <X className="w-3 h-3 ml-1" />
        </Badge>
      ))}
      {selectedNetworks.map((net) => (
        <Badge
          key={net}
          variant="secondary"
          className="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
          onClick={() => toggleNetwork(net)}
        >
          {net}
          <X className="w-3 h-3 ml-1" />
        </Badge>
      ))}
      {minRating > 0 && (
        <Badge
          variant="secondary"
          className="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
          onClick={() => setMinRating(0)}
        >
          {minRating}★ & up
          <X className="w-3 h-3 ml-1" />
        </Badge>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={clearFilters}
        className="text-gray-600 dark:text-gray-400 h-6 text-xs"
      >
        Clear All
      </Button>
    </div>
  );
}
