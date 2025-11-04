import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@radix-ui/react-label";

interface BrandFilterProps {
  brands: string[];
  selectedBrands: string[];
  toggleBrand: (brand: string) => void;
}

export default function BrandFilter({
  brands,
  selectedBrands,
  toggleBrand,
}: BrandFilterProps) {
  return (
    <div>
      <h3 className="font-medium text-sm mb-3 text-white">Brands</h3>
      <div className="space-y-2">
        {brands?.map((brand) => (
          <div
            key={brand}
            className="flex items-center cursor-pointer hover:bg-gray-900 p-1 rounded transition-colors"
            onClick={() => toggleBrand(brand)}
          >
            <Checkbox
              id={brand}
              checked={selectedBrands.includes(brand)}
              className="border-gray-600"
            />
            <Label
              htmlFor={brand}
              className="ml-2 text-sm cursor-pointer text-gray-300"
            >
              {brand}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
