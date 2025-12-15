import { useReview } from "@/hooks/review/useReview";
import { toast } from "sonner";
import { Label } from "@radix-ui/react-label";
import { ChevronDown, ChevronUp, Loader2, PenLine, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { StarRating } from "./StarRating";
import { MediaItem } from "./types";
import axios from "axios";
import { cn } from "@/lib/utils";


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
  const [isExpanded, setIsExpanded] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isAdding: submitting } = useReview();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (media.length + files.length > 5) {
      toast.error("Maximum 5 files allowed");
      return;
    }

    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      toast.error("Cloudinary not configured. Cannot upload images.");
      console.error("Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
      return;
    }

    setIsUploading(true);
    const newMedia: MediaItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      // Ensure this preset exists in your Cloudinary settings, or make it an env var
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "feed_upload");

      try {
        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData
        );

        newMedia.push({
          url: res.data.secure_url,
          type: file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
        });

      } catch (error) {
        console.error("Upload failed for file", file.name, error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setMedia((prev) => [...prev, ...newMedia]);
    setIsUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;

    // 1. Optimistic Close: Close UI immediately
    setShowAddReview(false);
    setIsExpanded(false);
    setMedia([]);
    setRating(0);
    setComment("");
    toast.success("Review posted!");

    // 2. Fire mutation in background
    Promise.resolve(onSubmit({
      rating,
      comment,
      media,
    })).catch((error) => {
      // 3. Handle Rollback/Error if server fails
      console.error("Failed to submit review:", error);
      toast.error("Failed to save review. Please check your connection.");
    });
  };

  const handleCancelInternal = () => {
    setIsExpanded(false);
    onCancel();
  };

  if (!isExpanded) {
    return (
      <div className="border border-border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setIsExpanded(true)}>
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="font-medium flex items-center gap-2">
            <PenLine className="w-4 h-4" />
            Write your review...
          </span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-card rounded-lg border border-border p-5 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-foreground">Your Experience</h3>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full text-muted-foreground hover:text-foreground" onClick={handleCancelInternal}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Rating */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rating</Label>
          <StarRating value={rating} onChange={setRating} size={28} />
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <Label htmlFor="comment" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Review
          </Label>
          <Textarea
            id="comment"
            placeholder="What did you like or dislike? How can we improve?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[120px] text-sm resize-y bg-muted/20 focus:bg-background transition-colors border-border text-foreground accent-primary"
          />
        </div>

        {/* Simplified Media Upload */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Photos / Videos</Label>

          <div className="flex flex-wrap gap-3">
            {media.map((item, index) => (
              <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
                {item.type === "VIDEO" ? (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium">Video</div>
                ) : (
                  <Image src={item.url} alt="Review media" layout="fill" objectFit="cover" />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {media.length < 5 && (
              <div
                onClick={() => {
                  console.log("Triggering file input click");
                  fileInputRef.current?.click();
                }}
                className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-muted/10 transition-all group"
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                ) : (
                  <UploadCloud className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            style={{ display: 'none' }} // Use inline style instead of className hidden
            onChange={(e) => {
              console.log("Input onChange event fired");
              handleFileSelect(e);
            }}
          // Removing disabled={isUploading} to prevent indefinite lock if something fails
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancelInternal}
            disabled={submitting}
            className="text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={rating === 0 || comment.length < 3 || isUploading || submitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Review"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
