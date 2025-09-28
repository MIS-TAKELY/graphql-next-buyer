import { Star } from "lucide-react";
import { useState } from "react";

export const StarRating = ({
  value,
  onChange,
  size = 8,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readonly?: boolean;
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const handleMouseEnter = (rating: number) => {
    if (!readonly) setHoverValue(rating);
  };

  const handleMouseLeave = () => {
    if (!readonly) setHoverValue(0);
  };

  const handleClick = (rating: number) => {
    if (!readonly) onChange?.(rating);
  };

  const displayValue = hoverValue || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => handleClick(rating)}
          onMouseEnter={() => handleMouseEnter(rating)}
          onMouseLeave={handleMouseLeave}
          disabled={readonly}
          aria-label={`Rate ${rating} star${rating > 1 ? "s" : ""}`}
          className={`p-2 transition-all duration-200 ${
            readonly
              ? "cursor-default"
              : "hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full"
          }`}
        >
          <Star
            className={`w-${size} h-${size} transition-colors duration-200 ${
              rating <= displayValue
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300 hover:text-yellow-200"
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-3 text-sm font-medium text-gray-700">
          {value} out of 5 stars
        </span>
      )}
    </div>
  );
};
