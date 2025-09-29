import { useReview } from "@/hooks/review/useReview";
import { Label } from "@radix-ui/react-label";
import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import { CardContent } from "../ui/card";
import { Textarea } from "../ui/textarea";
import {  MediaUploader } from "./MediaUploader";
import { StarRating } from "./StarRating";
import { MediaItem, ReviewMedia } from "./types";



export const AddReviewForm = ({
  onSubmit,
  onCancel,
  setShowAddReview,
}: {
  setShowAddReview: (input: boolean) => void;
  onSubmit: (payload: {
    rating: number;
    comment: string;
    media: MediaItem[];
  }) => Promise<void> | void;
  onCancel: () => void;
}) => {
  const [media, setMedia] = useState<ReviewMedia[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { loading: submitting } = useReview();

  const onUploadingChange = useCallback((uploading: boolean) => {
    setIsUploading(uploading);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowAddReview(false);
    if (isUploading) return;

    const uploadedMedia:MediaItem[] = media
      .filter((m) => m.status === "uploaded")
      .slice(0, 5)
      .map(({ url, type }) => ({ url, type }));

    try {
      await onSubmit({
        rating,
        comment,
        media: uploadedMedia,
      });

      setMedia([]);
      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  const isBusy = isUploading || submitting;
  const canSubmit = !isBusy && rating > 0 && comment.trim().length > 0;
  const uploadedCount = media.filter((m) => m.status === "uploaded").length;
  const uploadingCount = media.filter((m) => m.status === "uploading").length;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <CardContent className="space-y-8 p-6">
          {/* Rating Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900 flex items-center gap-1">
              Rating
              <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-4">
              <StarRating value={rating} onChange={setRating} size={10} />
              {rating > 0 && (
                <div className="px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full">
                  <span className="text-sm font-medium text-yellow-800">
                    {rating === 1
                      ? "Poor"
                      : rating === 2
                      ? "Fair"
                      : rating === 3
                      ? "Good"
                      : rating === 4
                      ? "Very Good"
                      : "Excellent"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Comment Section */}
          <div className="space-y-3">
            <Label
              htmlFor="comment"
              className="text-base font-semibold text-gray-900 flex items-center gap-1"
            >
              Your Review
              <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Textarea
                id="comment"
                placeholder="Share your detailed experience with this product. What did you like? What could be improved?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[140px] resize-none border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-base leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {comment.length}/500
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Minimum 10 characters required
            </p>
          </div>

          {/* Media Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold text-gray-900">
                Add Photos & Videos
              </Label>
              <span className="text-sm text-gray-500">
                Optional ({uploadedCount}/5)
              </span>
            </div>
            <MediaUploader
              value={media}
              onChange={setMedia}
              onUploadingChange={onUploadingChange}
              maxSizeMB={10}
            />
            {uploadingCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Uploading {uploadingCount} file{uploadingCount > 1 ? "s" : ""}
                ...
              </div>
            )}
          </div>
        </CardContent>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-2 b border-t">
          <Button
            variant="outline"
            onClick={onCancel}
            className="min-w-[100px] border-gray-300 hover:bg-gray-50"
            disabled={isBusy}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit}
            className="min-w-[140px] bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </div>
            ) : (
              "Submit Review"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
