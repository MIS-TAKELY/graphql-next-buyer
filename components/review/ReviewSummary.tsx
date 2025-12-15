import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export const ReviewSummary = ({
  total,
  average,
  ratings,
  onRatingClick,
  activeRating,
}: {
  total: number;
  average: number;
  ratings: Record<number, number>;
  onRatingClick?: (rating: number | null) => void;
  activeRating?: number;
}) => {
  return (
    <div className="flex flex-col gap-8">
      {/* Average Rating Block */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-1">
            <span className="text-5xl font-bold text-foreground">{average.toFixed(1)}</span>
            <Star className="w-8 h-8 fill-current text-foreground" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">{total} Ratings & Reviews</p>
        </div>

        <div className="h-12 w-px bg-border hidden md:block"></div>

        <div className="flex-1 hidden md:block">
          {/* Optional: Add extra aggregate stats here if available, implies rich data */}
        </div>
      </div>

      {/* Histogram */}
      <div className="space-y-3 w-full max-w-sm">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratings[rating] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          const isActive = activeRating === rating;

          return (
            <button
              key={rating}
              onClick={() => onRatingClick?.(rating)}
              className={cn(
                "flex items-center gap-4 w-full text-left group transition-opacity",
                activeRating && !isActive ? "opacity-40 hover:opacity-100" : "opacity-100"
              )}
            >
              <div className="flex items-center gap-1 w-8 shrink-0 text-sm font-medium text-muted-foreground group-hover:text-foreground">
                {rating} <Star className="w-3 h-3 fill-current text-muted-foreground group-hover:text-foreground" />
              </div>

              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    rating >= 4 ? "bg-green-500" : rating === 3 ? "bg-green-500" : rating === 2 ? "bg-orange-400" : "bg-red-500"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                {count}
              </div>
            </button>
          );
        })}
      </div>

      {activeRating && (
        <button onClick={() => onRatingClick?.(null)} className="text-sm text-primary font-medium self-start hover:underline">
          View All Reviews
        </button>
      )}
    </div>
  );
};
