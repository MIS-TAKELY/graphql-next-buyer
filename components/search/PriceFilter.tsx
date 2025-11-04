import { Slider } from "@/components/ui/slider";

interface PriceFilterProps {
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
}

export default function PriceFilter({
  priceRange,
  setPriceRange,
}: PriceFilterProps) {
  return (
    <div>
      <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-2">Price Range</h3>
      <Slider
        value={priceRange}
        onValueChange={setPriceRange}
        max={100000}
        step={1000}
        className="mb-2"
      />
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>₹{priceRange[0].toLocaleString("en-IN")}</span>
        <span>₹{priceRange[1].toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
}