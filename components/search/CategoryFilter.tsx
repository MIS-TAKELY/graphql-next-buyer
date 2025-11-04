import { Checkbox, } from "@/components/ui/checkbox";
import { Label } from "@radix-ui/react-label";

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  toggleCategory: (category: string) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategories,
  toggleCategory,
}: CategoryFilterProps) {
  return (
    <div>
      <h3 className="font-medium text-sm mb-3 text-white">Categories</h3>
      <div className="space-y-2">
        {categories?.map((category) => (
          <div
            key={category}
            className="flex items-center cursor-pointer hover:bg-gray-900 p-1 rounded transition-colors"
            onClick={() => toggleCategory(category)}
          >
            <Checkbox
              id={category}
              checked={selectedCategories.includes(category)}
              className="border-gray-600"
            />
            <Label
              htmlFor={category}
              className="ml-2 text-sm cursor-pointer text-gray-300"
            >
              {category}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
