import { Star } from "lucide-react";

export const ReviewSummary = ({
  total,
  average,
  ratings,
}: {
  total: number;
  average: number;
  ratings: Record<number, number>;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Overall */}
      <div className="text-center">
        <div className="text-4xl font-bold text-primary mb-2">
          {average.toFixed(1)}
        </div>
        <div className="flex justify-center mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 fill-current ${
                i < Math.floor(average) ? "text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <div className="text-sm text-gray-600">Based on {total} reviews</div>
      </div>

      {/* Breakdown */}
      <div className="col-span-2">
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratings[rating] || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm">{rating}</span>
                  <Star className="w-3 h-3 fill-current text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
