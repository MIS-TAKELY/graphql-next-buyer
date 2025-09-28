import { Star } from "lucide-react";

export const StarRating = ({
  value,
  onChange,
  size = 8,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number; // lucide size in tailwind units
}) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange?.(rating)}
          aria-label={`Rate ${rating} star${rating > 1 ? "s" : ""}`}
          className="p-1 hover:scale-110 transition-transform"
        >
          <Star
            className={`w-${size} h-${size} fill-current ${
              rating <= value ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm text-gray-600">
          {value} star{value !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
};
