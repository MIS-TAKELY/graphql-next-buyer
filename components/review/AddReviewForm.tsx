import { useReview } from "@/hooks/review/useReview";
import { Label } from "@radix-ui/react-label";
import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import { CardContent } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { MediaItem, MediaUploader } from "./MediaUploader";
import { StarRating } from "./StarRating";

export const AddReviewForm = ({
  onSubmit,
  onCancel,
}: {
  onSubmit: (payload: {
    rating: number;
    comment: string;
    media: MediaItem[]; // Keep as-is, but we'll map it internally
  }) => Promise<void> | void;
  onCancel: () => void;
}) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { addReview, loading: submitting } = useReview();

  const onUploadingChange = useCallback((uploading: boolean) => {
    setIsUploading(uploading);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (isUploading) return;

  const uploadedMedia = media
    .filter((m) => m.status === "uploaded")
    .slice(0, 5)
    .map(({ url, type }) => ({ url, type }));

  try {
    // This will immediately show the optimistic review
    await onSubmit({
      rating,
      comment,
      media: uploadedMedia,
    });
    
    // Reset form only after successful submission
    setMedia([]);
    setRating(0);
    setComment("");
  } catch (error) {
    console.error("Failed to submit review:", error);
    // Handle error (show toast, etc.)
  }
};

  const isBusy = isUploading || submitting;
  const canSubmit = !isBusy && rating > 0 && comment.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium">Rating *</Label>
          <div className="mt-2">
            <StarRating value={rating} onChange={setRating} />
          </div>
        </div>

        <div>
          <Label htmlFor="comment" className="text-base font-medium">
            Your Review *
          </Label>
          <Textarea
            id="comment"
            placeholder="Share your experience with this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-2 min-h-[120px]"
          />
        </div>

      
      </CardContent>

      <MediaUploader
        value={media}
        onChange={setMedia}
        onUploadingChange={onUploadingChange}
        maxSizeMB={10}
      />

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit}> {/* CHANGED: Use type="submit" instead of onClick */}
            Submit Review
          </Button>
        </div>

      {/* OPTIONAL: Remove this duplicate button if not needed; the one above handles submission */}
      {/* <button
        type="submit"
        disabled={!canSubmit}
        className={`px-4 py-2 rounded text-white ${
          canSubmit ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"
        }`}
      >
        {isUploading
          ? "Uploading media…"
          : submitting
          ? "Submitting review…"
          : "Submit review"}
      </button> */}
    </form>
  );
};