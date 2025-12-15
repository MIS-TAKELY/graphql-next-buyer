"use client";

import { useReview } from "@/hooks/review/useReview";
import { Star } from "lucide-react";
import { useMemo, useState } from "react";

import { AddReviewForm } from "@/components/review/AddReviewForm";
import { ReviewCard } from "@/components/review/ReviewCard";
import ReviewGallery from "./ReviewGallery";
import { FilterState, ReviewFilters } from "@/components/review/ReviewFilters";
import ReviewSkeleton from "@/components/review/ReviewSkeleton ";
import { ReviewSummary } from "@/components/review/ReviewSummary";
import { MediaItem, Review } from "@/components/review/types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";

const sortFns: Record<string, (a: Review, b: Review) => number> = {
  newest: (a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  oldest: (a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  highest: (a, b) => b.rating - a.rating,
  lowest: (a, b) => a.rating - b.rating,
  helpful: (a, b) => {
    if (!b.helpfulCount || !a.helpfulCount) {
      return 0;
    }
    return b.helpfulCount - a.helpfulCount;
  },
};

const ProductReviews = () => {
  const { userId } = useAuth();
  const [filters, setFilters] = useState<FilterState>({
    activeTab: "all",
    sortBy: "newest",
    filterRating: "all",
  });

  const { data, addReview, loading, stats, filterRating, setFilterRating, refetch,
    loadMore,
  } = useReview();

  // Use API data
  const reviews: Review[] = data || ([] as Review[]);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = reviews.filter((r) => {
      if (filterRating && r.rating !== filterRating) return false;
      if (filters.activeTab === "verified" && !r.verifiedPurchase) return false;
      if (filters.activeTab === "featured" && !r.isFeatured) return false;
      return true;
    });

    list = [...list].sort(sortFns[filters.sortBy] ?? sortFns.newest);
    return list;
  }, [reviews, filters, filterRating]);

  const [showAddReview, setShowAddReview] = useState(false);

  const handleSubmit = async (payload: {
    rating: number;
    comment: string;
    media?: MediaItem[];
  }) => {
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

  const handleRatingClick = (rating: number | null) => {
    const newValue = filterRating === rating ? undefined : (rating ?? undefined);
    setFilterRating(newValue);
    setFilters(prev => ({ ...prev, filterRating: newValue ? String(newValue) : "all" } as FilterState));
  };


  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">

      {/* Header Section with Stats */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-8 text-foreground">Customer Reviews</h2>

        <div className="bg-muted/30 rounded-xl p-8 flex flex-col md:flex-row gap-12 items-start md:items-center border border-border">
          {/* Summary Stats */}
          <div className="flex-1 min-w-[280px]">
            {stats ? (
              <ReviewSummary
                total={stats.total}
                average={stats.average}
                ratings={stats.counts.reduce((acc: any, curr: any) => ({ ...acc, [curr.rating]: curr.count }), {})}
                onRatingClick={handleRatingClick}
                activeRating={filterRating}
              />
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground">Loading stats...</div>
            )}
          </div>

          {/* Call to Action: Write Review */}
          <div className="flex-1 w-full md:border-l md:pl-12 border-border">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Review this product</h3>
            <p className="text-muted-foreground mb-6 text-sm">Share your thoughts with other customers</p>

            {userId ? (
              <div className="w-full">
                <AddReviewForm
                  onCancel={() => setShowAddReview(false)}
                  onSubmit={handleSubmit}
                  setShowAddReview={setShowAddReview}
                />
              </div>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                Log in to Review
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-border pb-6 mb-8">
        <ReviewFilters value={filters} onChange={setFilters} hideRatingFilter={true} />
        <div className="text-sm text-muted-foreground">
          Scanning {filtered.length} reviews
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-0">
        {loading && !filtered.length ? (
          <ReviewSkeleton />
        ) : filtered.length > 0 ? (
          <>
            {filtered.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
              />
            ))}

            <div className="pt-10 flex justify-center">
              <Button
                variant="outline"
                className="min-w-[200px]"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More Reviews"}
              </Button>
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Star className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground">No reviews yet</p>
            <p className="text-muted-foreground mt-1">Be the first to share your experience!</p>
          </div>
        )}
      </div>

      {/* Gallery - now at bottom, nicely separated */}
      {reviews.some(r => r.media?.length) && (
        <div className="mt-16 pt-12 border-t border-border">
          <h3 className="font-semibold text-xl mb-6 text-foreground">Customer Photos & Videos</h3>
          <ReviewGallery images={reviews.flatMap(r => r.media?.map(m => m.url) || [])} />
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
