import { Review } from "@/components/review/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/utlis/dateHelpers";
import { Star, ThumbsDown, ThumbsUp } from "lucide-react";

export const ReviewCard = ({ review }: { review: Review }) => {
  const initials = `${review.user?.firstName?.[0] ?? ""}${
    review.user?.lastName?.[0] ?? ""
  }`;

  return (
    <Card className={review.isFeatured ? "ring-2 ring-blue-200" : ""}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">{initials}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {review.user?.firstName} {review.user?.lastName}
                </span>
                {review.verifiedPurchase && (
                  <Badge variant="secondary" className="text-xs">
                    Verified Purchase
                  </Badge>
                )}
                {review.isFeatured && (
                  <Badge variant="default" className="text-xs bg-blue-500">
                    Featured
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 fill-current ${
                        i < review.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

        {review.media?.length > 0 && (
          <div className="flex gap-2 mb-4">
            {review.media.map((m,index) => (
              <div key={index} className="w-20 h-20 rounded-lg overflow-hidden">
                <img
                  src={m.url}
                  alt="Review media"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 border-t">
          <span className="text-sm text-gray-600">Was this helpful?</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 h-8"
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm">Yes ({review.helpfulCount})</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 h-8"
            >
              <ThumbsDown className="w-4 h-4" />
              <span className="text-sm">No</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
