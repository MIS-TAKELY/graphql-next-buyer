"use client";

import { toast } from "sonner";

import { Review, ReviewMedia } from "@/components/review/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useReview } from "@/hooks/review/useReview";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utlis/dateHelpers";
import { useAuth } from "@clerk/nextjs";
import {
  CheckCircle2,
  Edit2,
  MoreVertical,
  Star,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MediaUploader } from "./MediaUploader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ReviewCard = ({ review }: { review: Review }) => {
  const { updateReview, removeReview, isUpdating, isDeleting } = useReview();
  const { userId } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Helpful vote state
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [hasVoted, setHasVoted] = useState(false);

  const handleHelpfulVote = (isHelpful: boolean) => {
    if (hasVoted) return;
    setHasVoted(true);
    if (isHelpful) {
      setHelpfulCount((prev) => prev + 1);
    }
  };

  const convertToMediaItems = (media: Review["media"]): ReviewMedia[] => {
    return (media || []).map((m, index) => ({
      id: `existing_${index}_${Date.now()}`,
      url: m.url,
      type: m.type as "IMAGE" | "VIDEO",
      name: `media_${index}`,
      size: 0,
      status: "uploaded" as const,
      publicId: m.publicId,
    }));
  };

  const [editForm, setEditForm] = useState({
    rating: review.rating,
    comment: review.comment || "",
  });

  const [mediaItems, setMediaItems] = useState<ReviewMedia[]>(() =>
    isEditing ? convertToMediaItems(review.media) : []
  );

  const isOwnReview = userId === review.user?.clerkId;

  const handleEdit = async () => {
    if (isUploading) return;
    setIsEditing(false);

    const updatedMedia = mediaItems
      .filter((item) => item.status === "uploaded")
      .map((item) => ({
        url: item.url,
        type: item.type,
        status: "uploaded" as const,
        publicId: item.publicId,
      }));

    updateReview(review.id, {
      rating: editForm.rating,
      comment: editForm.comment,
      media: updatedMedia,
    })
      .then(() => {
        toast.success("Review updated!");
      })
      .catch((err) => {
        console.error("Failed to update review:", err);
        toast.error("Failed to update review");
        setIsEditing(true);
      });
  };

  const handleDelete = async () => {
    try {
      await removeReview(review.id);
      toast.success("Review deleted");
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete review:", error);
      toast.error("Failed to delete review");
    }
  };

  const handleRatingChange = (newRating: number) => {
    setEditForm((prev) => ({ ...prev, rating: newRating }));
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setMediaItems(convertToMediaItems(review.media));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      rating: review.rating,
      comment: review.comment || "",
    });
    setMediaItems([]);
  };

  // Keyboard nav for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "ArrowLeft") {
        setCurrentMediaIndex((prev) =>
          prev === 0 ? review.media.length - 1 : prev - 1
        );
      } else if (e.key === "ArrowRight") {
        setCurrentMediaIndex((prev) =>
          prev === review.media.length - 1 ? 0 : prev + 1
        );
      } else if (e.key === "Escape") {
        setLightboxOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, review.media.length]);

  // Color logic for rating badge
  const ratingColor = review.rating >= 4 ? "bg-green-600" : review.rating >= 3 ? "bg-green-500" : review.rating >= 2 ? "bg-orange-500" : "bg-red-500";

  return (
    <>
      <div className={cn("py-4 border-b border-border last:border-0", review.isFeatured && "bg-accent/30 -mx-4 px-4")}>
        <div className="flex items-start justify-between gap-4">

          <div className="flex-1 space-y-1.5">

            {/* Rating Badge & Recommendation */}
            <div className="flex items-center gap-3">
              {isEditing ? (
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 cursor-pointer ${i < editForm.rating ? "text-yellow-400 fill-current" : "text-muted"
                        }`}
                      onClick={() => handleRatingChange(i + 1)}
                    />
                  ))}
                </div>
              ) : (
                <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded text-white text-[12px] font-bold shadow-sm", ratingColor)}>
                  <span>{review.rating}</span>
                  <Star className="w-2.5 h-2.5 fill-current" />
                </div>
              )}

              {!isEditing && (
                <span className="text-sm font-semibold text-foreground">
                  {review.rating >= 4 ? "Excellent" : review.rating >= 3 ? "Good" : review.rating >= 2 ? "Fair" : "Poor"}
                </span>
              )}
            </div>

            {/* Review Body */}
            {isEditing ? (
              <div className="space-y-4 pt-2">
                <Textarea
                  value={editForm.comment}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, comment: e.target.value }))
                  }
                  className="min-h-[100px] text-base bg-background text-foreground"
                  placeholder="Edit your review..."
                />
                <MediaUploader
                  value={mediaItems}
                  onChange={setMediaItems}
                  maxSizeMB={10}
                  onUploadingChange={setIsUploading}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                  <Button size="sm" onClick={handleEdit} disabled={isUploading || isUpdating}>Save</Button>
                </div>
              </div>
            ) : (
              <div className="mt-1">
                <p className="text-foreground text-[14px] leading-relaxed">
                  {review.comment}
                </p>

                {/* Media Grid */}
                {review.media?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {review.media.map((m, index) => (
                      <div
                        key={index}
                        className="w-16 h-16 relative rounded-md overflow-hidden cursor-pointer border border-border hover:opacity-90 transition-opacity"
                        onClick={() => {
                          setCurrentMediaIndex(index);
                          setLightboxOpen(true);
                        }}
                      >
                        {m.type === "VIDEO" ? (
                          <div className="w-full h-full bg-black flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"></div>
                          </div>
                        ) : (
                          <Image
                            src={m.url}
                            alt="Review media"
                            layout="fill"
                            objectFit="cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer: Author, Date, Actions */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80">{review.user?.firstName} {review.user?.lastName}</span>

              {review.verifiedPurchase && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-muted-foreground fill-muted/30" />
                  Certified Buyer
                </span>
              )}

              <span>{formatDate(review.createdAt)}</span>

              {!isEditing && (
                <div className="flex items-center gap-4 ml-auto sm:ml-4">
                  <div
                    className={cn("flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors", hasVoted && "text-primary font-medium")}
                    onClick={() => handleHelpfulVote(true)}
                  >
                    <ThumbsUp className={cn("w-3.5 h-3.5", hasVoted && "fill-current")} />
                    <span>{helpfulCount || 0}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Context Menu for Owner */}
          {isOwnReview && !isEditing && !review.isOptimistic && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleStartEdit}>
                  <Edit2 className="w-3.5 h-3.5 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setIsDeleteModalOpen(true)}>
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

        </div>
      </div>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Review?</DialogTitle>
            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {review.media?.length > 0 && (
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-4xl p-0 bg-black border-none ring-0 overflow-hidden text-white">
            {/* Simple Custom Lightbox UI */}
            <div className="relative w-full h-[80vh] flex items-center justify-center select-none">
              <button className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full hover:bg-black/70" onClick={() => setLightboxOpen(false)}>
                <X className="w-5 h-5" />
              </button>

              <div className="absolute left-4 z-40">
                <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full h-10 w-10 p-0" onClick={() => setCurrentMediaIndex((i) => i === 0 ? review.media.length - 1 : i - 1)}>
                  ‹
                </Button>
              </div>

              <div className="w-full h-full flex items-center justify-center">
                {review.media[currentMediaIndex].type === "VIDEO" ? (
                  <video src={review.media[currentMediaIndex].url} controls autoPlay className="max-h-full max-w-full" />
                ) : (
                  <div className="relative w-full h-full">
                    <Image
                      src={review.media[currentMediaIndex].url}
                      alt="Full size"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                )}
              </div>

              <div className="absolute right-4 z-40">
                <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full h-10 w-10 p-0" onClick={() => setCurrentMediaIndex((i) => i === review.media.length - 1 ? 0 : i + 1)}>
                  ›
                </Button>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-xs">
                {currentMediaIndex + 1} / {review.media.length}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
