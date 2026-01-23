"use client";

import { useReview } from "@/hooks/review/useReview";
import { Loader2, Star, UploadCloud, X } from "lucide-react";
import { useMemo, useState, useRef } from "react";

import { AddReviewForm } from "@/components/review/AddReviewForm";
import { ReviewCard } from "@/components/review/ReviewCard";
import { FilterState } from "@/components/review/ReviewFilters";
import ReviewSkeleton from "@/components/review/ReviewSkeleton";
import { StarRating } from "@/components/review/StarRating";
import { MediaItem, Review } from "@/components/review/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import Image from "next/image";

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

const ProductReviews = ({ isOwnProduct }: { isOwnProduct?: boolean }) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
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

  // Find user's own review
  const userReview = useMemo(() => {
    if (!userId) return null;
    return reviews.find((r) => r.user?.id === userId);
  }, [reviews, userId]);

  // Filter out user's review from the main list
  const otherReviews = useMemo(() => {
    if (!userReview) return reviews;
    return reviews.filter((r) => r.id !== userReview.id);
  }, [reviews, userReview]);

  // Filter + sort (only for other reviews, user's review is always shown first)
  const filtered = useMemo(() => {
    let list = otherReviews.filter((r) => {
      if (filterRating && r.rating !== filterRating) return false;
      if (filters.activeTab === "verified" && !r.verifiedPurchase) return false;
      if (filters.activeTab === "featured" && !r.isFeatured) return false;
      return true;
    });

    list = [...list].sort(sortFns[filters.sortBy] ?? sortFns.newest);
    return list;
  }, [otherReviews, filters, filterRating]);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewMedia, setReviewMedia] = useState<Array<{
    url: string;
    type: "IMAGE" | "VIDEO";
    status?: "uploading" | "uploaded" | "error";
  }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (reviewMedia.length + files.length > 5) {
      toast.error("Maximum 5 files allowed");
      return;
    }

    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      toast.error("Cloudinary not configured. Cannot upload images.");
      console.error("Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
      return;
    }

    setIsUploading(true);
    const newMedia: typeof reviewMedia = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "feed_upload");

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();

        newMedia.push({
          url: data.secure_url,
          type: file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
          status: "uploaded",
        });

      } catch (error) {
        console.error("Upload failed for file", file.name, error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setReviewMedia((prev) => [...prev, ...newMedia]);
    setIsUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeMedia = (index: number) => {
    setReviewMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSimpleSubmit = async () => {
    if (reviewRating === 0 || reviewComment.trim().length < 3) return;
    if (isUploading) {
      toast.error("Please wait for uploads to complete");
      return;
    }

    setIsSubmitting(true);

    // Clear inputs immediately for instant feedback
    const rating = reviewRating;
    const comment = reviewComment;
    const media = reviewMedia;
    setReviewRating(0);
    setReviewComment("");
    setReviewMedia([]);

    try {
      await addReview({
        rating,
        comment,
        media,
      });
      toast.success("Review posted successfully!");
    } catch (error) {
      console.error("Failed to submit review:", error);
      // Restore values on error
      setReviewRating(rating);
      setReviewComment(comment);
      setReviewMedia(media);
      toast.error("Failed to post review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="space-y-4 py-4 border-t">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Reviews & Ratings</h2>
        <div className="flex items-center gap-1.5 bg-green-600 text-white px-2 py-0.5 rounded text-sm font-bold">
          {stats?.average.toFixed(1) || "0.0"}
          <Star className="w-3 h-3 fill-current" />
        </div>
      </div>

      {stats && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{stats.total} ratings</span>
        </div>
      )}

      {/* Simple Add Review Section - Only show if user hasn't reviewed yet */}
      {!isOwnProduct && userId && !userReview && (
        <div className="bg-muted/10 rounded-lg p-3 border border-border/50">
          <p className="text-sm font-semibold mb-2">Add a Review</p>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <StarRating value={reviewRating} onChange={setReviewRating} size={5} />
            </div>

            {/* Image Upload Section */}
            <div className="flex flex-wrap gap-2">
              {reviewMedia.map((item, index) => (
                <div key={index} className="relative w-16 h-16 rounded border border-border overflow-hidden group">
                  {item.type === "VIDEO" ? (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-medium">Video</div>
                  ) : (
                    <Image src={item.url} alt="Review media" fill className="object-cover" unoptimized />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {reviewMedia.length < 5 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 border-2 border-dashed border-border rounded flex items-center justify-center cursor-pointer hover:border-primary hover:bg-muted/10 transition-all"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : (
                    <UploadCloud className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />

            <div className="relative">
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm min-h-[60px] resize-none focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
              <button
                disabled={reviewRating === 0 || reviewComment.trim().length < 3 || isSubmitting || isUploading}
                onClick={handleSimpleSubmit}
                className="absolute bottom-2 right-2 bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? "..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show sign-in prompt if not logged in */}
      {!isOwnProduct && !userId && (
        <div className="bg-muted/10 rounded-lg p-3 border border-border/50">
          <div className="flex items-center justify-between text-xs py-1">
            <p className="text-muted-foreground">Sign in to rate this product</p>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => (window.location.href = "/sign-in")}
            >
              Sign In
            </Button>
          </div>
        </div>
      )}

      {/* Minimal Filters */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {["newest", "highest", "lowest"].map((sort) => (
            <button
              key={sort}
              onClick={() => setFilters({ ...filters, sortBy: sort as any })}
              className={cn(
                "text-[11px] px-2 py-1 rounded-full border transition-colors",
                filters.sortBy === sort
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary"
              )}
            >
              {sort.charAt(0).toUpperCase() + sort.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading && !filtered.length && !userReview ? (
          <ReviewSkeleton />
        ) : (
          <>
            {/* User's Review - Always shown first if exists */}
            {userReview && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-[10px] font-semibold">Your Review</Badge>
                </div>
                <ReviewCard key={userReview.id} review={userReview} />
              </div>
            )}

            {/* Other Reviews */}
            {filtered.length > 0 ? (
              <>
                {userReview && <div className="border-t border-border pt-4 mt-4" />}
                <div className="space-y-1">
                  {filtered.slice(0, 3).map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>

                {filtered.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground"
                    onClick={loadMore}
                  >
                    View More Reviews
                  </Button>
                )}
              </>
            ) : !userReview ? (
              <p className="text-sm text-muted-foreground py-2 text-center">No reviews yet.</p>
            ) : null}
          </>
        )}
      </div>

      {/* Compact Gallery */}
      {reviews.some((r) => r.media?.length) && (
        <div className="pt-2">
          <p className="text-xs font-semibold mb-2">Customer Photos</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {reviews
              .flatMap((r) => r.media?.map((m) => m.url) || [])
              .slice(0, 5)
              .map((url, i) => (
                <div
                  key={i}
                  className="relative w-12 h-12 rounded border overflow-hidden shrink-0"
                >
                  <Image src={url} alt="Review" fill className="object-cover" unoptimized />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
