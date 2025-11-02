import { Card, CardContent } from "@/components/ui/card";
import PriceFilter from "./PriceFilter";
import BrandFilter from "./BrandFilter";
import CategoryFilter from "./CategoryFilter";
import NetworkFilter from "./NetworkFilter";
import RatingFilter from "./RatingFilter";

interface FilterSidebarProps {
  showFilters: boolean;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  selectedCategories: string[];
  toggleCategory: (category: string) => void;
  selectedBrands: string[];
  toggleBrand: (brand: string) => void;
  selectedNetworks: string[];
  toggleNetwork: (network: string) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
  categories: string[];
  brands: string[];
  networks: string[];
}

export default function FilterSidebar({
  showFilters,
  priceRange,
  setPriceRange,
  selectedCategories,
  toggleCategory,
  selectedBrands,
  toggleBrand,
  selectedNetworks,
  toggleNetwork,
  minRating,
  setMinRating,
  categories,
  brands,
  networks,
}: FilterSidebarProps) {
  return (
    <aside
      className={`${
        showFilters ? "block" : "hidden"
      } lg:block w-64 flex-shrink-0`}
    >
      <div className="sticky top-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
            <PriceFilter
              priceRange={priceRange}
              setPriceRange={setPriceRange}
            />
            <CategoryFilter
              categories={categories}
              selectedCategories={selectedCategories}
              toggleCategory={toggleCategory}
            />
            <NetworkFilter
              networks={networks}
              selectedNetworks={selectedNetworks}
              toggleNetwork={toggleNetwork}
            />
            <BrandFilter
              brands={brands}
              selectedBrands={selectedBrands}
              toggleBrand={toggleBrand}
            />
            <RatingFilter minRating={minRating} setMinRating={setMinRating} />
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
