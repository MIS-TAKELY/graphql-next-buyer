import { useReview } from "@/hooks/review/useReview";
import { Label } from "@radix-ui/react-label";
import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import { CardContent } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { MediaItem, MediaUploader } from "./MediaUploader";
import { StarRating } from "./StarRating";

export type ReviewMedia = {
  url: string;
  type: "IMAGE" | "VIDEO";
};

export const AddReviewForm = ({
  onSubmit,
  onCancel,
}: {
  onSubmit: (payload: {
    rating: number;
    comment: string;
    media: ReviewMedia[];
  }) => Promise<void> | void;
  onCancel: () => void;
}) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { loading: submitting } = useReview();

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
  const uploadedCount = media.filter(m => m.status === "uploaded").length;
  const uploadingCount = media.filter(m => m.status === "uploading").length;

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
                    {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Very Good" : "Excellent"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Comment Section */}
          <div className="space-y-3">
            <Label htmlFor="comment" className="text-base font-semibold text-gray-900 flex items-center gap-1">
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
                Uploading {uploadingCount} file{uploadingCount > 1 ? 's' : ''}...
              </div>
            )}
          </div>
        </CardContent>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-2 bg-gray-50 border-t">
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

// Enhanced StarRating Component
import { Star } from "lucide-react";

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

// Enhanced MediaUploader Component
import { uploadToCloudinary } from "@/servers/utils/uploadToCloudinary";
import { formatFileSize } from "@/utlis/dateHelpers";
import { Upload, X, Image, Video, AlertCircle, CheckCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export type MediaItem = {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  name: string;
  size: number;
  status?: "uploading" | "uploaded" | "error";
  publicId?: string;
};

export const MediaUploader = ({
  value,
  onChange,
  maxSizeMB = 10,
  onUploadingChange,
}: {
  value: MediaItem[];
  onChange: React.Dispatch<React.SetStateAction<MediaItem[]>>;
  maxSizeMB?: number;
  onUploadingChange?: (uploading: boolean) => void;
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const uploading = value.some((m) => m.status === "uploading");
    onUploadingChange?.(uploading);
  }, [value, onUploadingChange]);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remainingSlots = 5 - value.length;
      const filesToProcess = fileArray.slice(0, remainingSlots);

      const valid = filesToProcess.filter((file) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        const isValidSize = file.size <= maxSizeMB * 1024 * 1024;
        return (isImage || isVideo) && isValidSize;
      });

      if (valid.length !== filesToProcess.length) {
        // Could show a toast notification here for invalid files
        console.warn("Some files were skipped due to invalid format or size");
      }

      valid.forEach(async (file) => {
        const localUrl = URL.createObjectURL(file);
        const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const mediaItem: MediaItem = {
          id,
          url: localUrl,
          type: file.type.startsWith("image/") ? "IMAGE" : "VIDEO",
          name: file.name,
          size: file.size,
          status: "uploading",
        };

        onChange((prev) => [...prev, mediaItem]);

        try {
          const resourceType = file.type.startsWith("image/") ? "image" : "video";
          const result = await uploadToCloudinary(file, resourceType);

          onChange((prevValue) =>
            prevValue.map((item) =>
              item.id === mediaItem.id
                ? {
                    ...item,
                    url: result.url,
                    status: "uploaded",
                    publicId: result.publicId,
                    size: result.size ?? item.size,
                  }
                : item
            )
          );
        } catch (e) {
          console.error("Upload failed:", e);
          onChange((prevValue) =>
            prevValue.map((item) =>
              item.id === mediaItem.id ? { ...item, status: "error" } : item
            )
          );
        } finally {
          URL.revokeObjectURL(localUrl);
        }
      });
    },
    [maxSizeMB, onChange, value.length]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const onInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) handleFiles(e.target.files);
      e.target.value = "";
    },
    [handleFiles]
  );

  const removeMedia = useCallback(
    (id: string) => onChange((prev) => prev.filter((m) => m.id !== id)),
    [onChange]
  );

  const retryUpload = useCallback(
    (id: string) => {
      const mediaItem = value.find(m => m.id === id);
      if (!mediaItem) return;
      
      // Reset status to uploading and retry
      onChange(prev => prev.map(item => 
        item.id === id ? { ...item, status: "uploading" } : item
      ));
      
      // Re-trigger upload logic here
    },
    [value, onChange]
  );

  const canUploadMore = value.length < 5;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {canUploadMore && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);
          }}
          onDrop={onDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer group ${
            isDragOver
              ? "border-blue-400 bg-blue-50 scale-[1.02]"
              : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
          }`}
        >
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={onInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full transition-colors ${
                isDragOver ? "bg-blue-100" : "bg-gray-100 group-hover:bg-blue-50"
              }`}>
                <Upload className={`w-8 h-8 transition-colors ${
                  isDragOver ? "text-blue-600" : "text-gray-600 group-hover:text-blue-500"
                }`} />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isDragOver ? "Drop your files here" : "Upload photos & videos"}
            </h3>
            <p className="text-gray-600 mb-3">
              Drag and drop your files here, or{" "}
              <span className="text-blue-600 font-medium">browse</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                <span>Images: JPG, PNG, GIF</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                <span>Videos: MP4, MOV</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Max {maxSizeMB}MB per file • Up to 5 files total
            </p>
          </div>
        </div>
      )}

      {/* Media Preview Grid */}
      {value?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-800">
              Uploaded Files ({value.length}/5)
            </h4>
            {value.some(m => m.status === "error") && (
              <span className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Some uploads failed
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {value.map((media) => (
              <div key={media.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 group-hover:border-gray-300 transition-colors">
                  {media.type === "IMAGE" ? (
                    <img
                      src={media.url}
                      alt={media.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="relative w-full h-full bg-gray-900">
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Video className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Status Overlays */}
                  {media.status === "uploading" && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-2" />
                      <span className="text-white text-xs font-medium">Uploading...</span>
                    </div>
                  )}
                  
                  {media.status === "uploaded" && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
                      <CheckCircle className="w-3 h-3" />
                    </div>
                  )}
                  
                  {media.status === "error" && (
                    <div className="absolute inset-0 bg-red-600/80 text-white flex flex-col items-center justify-center p-2">
                      <AlertCircle className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium text-center">Upload failed</span>
                      <button
                        onClick={() => retryUpload(media.id)}
                        className="text-xs underline mt-1 hover:no-underline"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => removeMedia(media.id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-300"
                    aria-label="Remove media"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  {/* File Info on Hover */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs font-medium truncate">{media.name}</p>
                    <p className="text-xs text-gray-300">{formatFileSize(media.size)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};