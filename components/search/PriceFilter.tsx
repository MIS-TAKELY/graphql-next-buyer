import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PriceFilterProps {
  selectedPriceRanges: string[];
  togglePriceRange: (range: string) => void;
}

const PRICE_RANGES = [
  { label: "Under रु 10,000", value: "0-10000" },
  { label: "रु 10,000 - रु 25,000", value: "10000-25000" },
  { label: "रु 25,000 - रु 50,000", value: "25000-50000" },
  { label: "रु 50,000 - रु 1,00,000", value: "50000-100000" },
  { label: "Over रु 1,00,000", value: "100000+" },
];

export default function PriceFilter({
  selectedPriceRanges,
  togglePriceRange,
}: PriceFilterProps) {
  return (
    <div>
      <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-2">Price Range</h3>
      <div className="space-y-2">
        {PRICE_RANGES.map((range) => (
          <div key={range.value} className="flex items-center space-x-2">
            <Checkbox
              id={`price-${range.value}`}
              checked={selectedPriceRanges.includes(range.value)}
              onCheckedChange={() => togglePriceRange(range.value)}
              className="border-gray-300 dark:border-gray-600"
            />
            <Label
              htmlFor={`price-${range.value}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {range.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}