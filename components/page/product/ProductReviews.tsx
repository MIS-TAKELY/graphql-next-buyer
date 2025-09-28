"use client";

import { useReview } from "@/hooks/review/useReview";
import { ChevronDown, Plus, Star } from "lucide-react";
import { useMemo, useState } from "react";

import { AddReviewForm } from "@/components/review/AddReviewForm";
import { ReviewCard } from "@/components/review/ReviewCard";
import { FilterState, ReviewFilters } from "@/components/review/ReviewFilters";
import ReviewSkeleton from "@/components/review/ReviewSkeleton ";
import { ReviewSummary } from "@/components/review/ReviewSummary";
import { MediaItem, Review } from "@/components/review/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sortFns: Record<string, (a: Review, b: Review) => number> = {
  newest: (a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  oldest: (a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  highest: (a, b) => b.rating - a.rating,
  lowest: (a, b) => a.rating - b.rating,
  helpful: (a, b) => b.helpfulCount - a.helpfulCount,
};

const ProductReviews = () => {
  const [filters, setFilters] = useState<FilterState>({
    activeTab: "all",
    sortBy: "newest",
    filterRating: "all",
  });

  // console.log("cachedReviews", cachedReviews);

  const { data, addReview, loading } = useReview();

  // Use API data if present, otherwise fall back to mocks
  // const reviews: Review[] = cachedReviews
  //   ? cachedReviews
  //   : data || ([] as Review[]);

  const reviews: Review[] = data || ([] as Review[]);

  // // Derived stats
  const { total, average, ratings } = useMemo(() => {
    const total = reviews.length;
    const average =
      total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
    const ratings: Record<number, number> = {};
    for (const r of reviews) ratings[r.rating] = (ratings[r.rating] || 0) + 1;
    return { total, average, ratings };
  }, [reviews]);

  // // Filter + sort
  const filtered = useMemo(() => {
    let list = reviews.filter((r) => {
      if (filters.activeTab === "verified" && !r.verifiedPurchase) return false;
      if (filters.activeTab === "featured" && !r.isFeatured) return false;
      if (filters.filterRating !== "all" && r.rating !== +filters.filterRating)
        return false;
      return true;
    });

    list = [...list].sort(sortFns[filters.sortBy] ?? sortFns.newest);
    return list;
  }, [reviews, filters]);

  const [showAddReview, setShowAddReview] = useState(false);
  const handleSubmit = async (payload: {
    rating: number;
    comment: string;
    media: MediaItem[];
  }) => {
    console.log("form data-->", ratings, payload.comment, payload.media);
    try {
      await addReview({
        rating: payload.rating,
        comment: payload.comment,
        media: payload.media,
      });
      setShowAddReview(false);
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Customer Reviews</span>
            <Button
              onClick={() => setShowAddReview((s) => !s)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Write a Review
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewSummary total={total} average={average} ratings={ratings} />
        </CardContent>
      </Card>

      {/* Add Review */}
      {showAddReview && (
        <AddReviewForm
          onCancel={() => setShowAddReview(false)}
          onSubmit={handleSubmit}
        />
      )}

      {/* Filters */}
      <ReviewFilters value={filters} onChange={setFilters} />

      {/* List */}
      {loading ? (
        <ReviewSkeleton />
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

          <div className="text-center pt-6">
            <Button variant="outline" className="flex items-center gap-2">
              Load More Reviews
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-2">
              <Star className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reviews found
            </h3>
            <p className="text-gray-600">
              Be the first to review this product!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductReviews;
