import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";

interface RatingFilterProps {
  minRating: number;
  setMinRating: (rating: number) => void;
}

export default function RatingFilter({
  minRating,
  setMinRating,
}: RatingFilterProps) {
  const ratings = [4, 3, 2, 1];

  return (
    <div>
      <h3 className="font-medium text-sm mb-3 text-gray-900 dark:text-white">Rating</h3>
      <div className="space-y-2">
        {ratings.map((rating) => (
          <div
            key={rating}
            className="flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded transition-colors"
            onClick={() => setMinRating(rating === minRating ? 0 : rating)}
          >
            <Checkbox
              id={`rating-${rating}`}
              checked={minRating === rating}
              className="border-gray-300 dark:border-gray-600"
            />
            <div className="ml-2 flex items-center gap-1 text-sm">
              <div className="flex">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3 h-3 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-gray-600 dark:text-gray-400">& up</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}