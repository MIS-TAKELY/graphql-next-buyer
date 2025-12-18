// components/filter/FilterSidebar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

// Mock data (replace with props or API data)
const BRANDS = ["Apple", "Samsung", "Xiaomi", "OnePlus", "Google"];
const RATINGS = [4, 3, 2, 1];

interface FilterSidebarProps {
  onFilterChange: (filters: any) => void;
}

export default function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);

  const handleApply = () => {
    onFilterChange({
      priceRange,
      brands: selectedBrands,
      minRating,
    });
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  return (
    <div className="w-full space-y-8 bg-card p-6 rounded-xl border border-border h-fit">
      <div>
        <h3 className="text-lg font-semibold mb-4">Price Range</h3>
        <Slider
          defaultValue={[0, 200000]}
          max={200000}
          step={1000}
          value={priceRange}
          onValueChange={setPriceRange}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>रु{priceRange[0]}</span>
          <span>रु{priceRange[1]}</span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Brands</h3>
        <div className="space-y-3">
          {BRANDS.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
              />
              <Label
                htmlFor={`brand-${brand}`}
                className="text-sm cursor-pointer font-normal"
              >
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Customer Ratings</h3>
        <div className="space-y-2">
          {RATINGS.map((rating) => (
            <div
              key={rating}
              className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded-md"
              onClick={() => setMinRating(rating)}
            >
              <Checkbox
                checked={minRating === rating}
                id={`rating-${rating}`}
                onCheckedChange={() => setMinRating(rating)}
              />
              <div className="flex items-center">
                <span className="text-sm mr-2">{rating}★ & up</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={handleApply} className="w-full">
        Apply Filters
      </Button>
    </div>
  );
}
