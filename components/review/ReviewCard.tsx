"use client";

import { Review, ReviewMedia } from "@/components/review/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { formatDate } from "@/utlis/dateHelpers";
import { useAuth } from "@clerk/nextjs";
import {
  Edit2,
  Save,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { MediaUploader } from "./MediaUploader";

export const ReviewCard = ({ review }: { review: Review }) => {
  // console.log("review-->",review)
  const { updateReview, removeReview, isUpdating, isDeleting } = useReview();
  const { userId } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Convert existing review media to MediaItem format
  const convertToMediaItems = (media: Review["media"]): ReviewMedia[] => {
    return (media || []).map((m, index) => ({
      id: `existing_${index}_${Date.now()}`,
      url: m.url,
      type: m.type as "IMAGE" | "VIDEO",
      name: `media_${index}`,
      size: 0, // We don't have size for existing media
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

  const initials = `${review.user?.firstName?.[0] ?? ""}${
    review.user?.lastName?.[0] ?? ""
  }`;

  const handleEdit = async () => {
    if (isUploading) {
      // Optionally show a toast that uploads are still in progress
      return;
    }

    setIsEditing(false);

    // Convert MediaItems back to review media format
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
    }).catch((err) => {
      console.error("Failed to update review:", err);
      setIsEditing(true); // Re-open editing on error
    });
  };

  const handleDelete = async () => {
    try {
      await removeReview(review.id);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete review:", error);
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

  return (
    <>
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
                  {isEditing ? (
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 cursor-pointer ${
                            i < editForm.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                          onClick={() => handleRatingChange(i + 1)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 fill-current ${
                            i < review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  <span className="text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            {isOwnReview && !review.isOptimistic && (
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleStartEdit}
                      disabled={isUpdating || isDeleting}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsDeleteModalOpen(true)}
                      disabled={isUpdating || isDeleting}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEdit}
                      disabled={isUpdating || isUploading}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4 mb-4">
              <Textarea
                value={editForm.comment}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, comment: e.target.value }))
                }
                placeholder="Edit your comment..."
                className="min-h-[100px]"
              />
              <MediaUploader
                value={mediaItems}
                onChange={setMediaItems}
                maxSizeMB={10}
                onUploadingChange={setIsUploading}
              />
            </div>
          ) : (
            <>
              <p className="text-gray-700 mb-4 leading-relaxed">
                {review.comment}
              </p>

              {review.media?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {review.media.map((m, index) => (
                    <div
                      key={index}
                      className="w-20 h-20 rounded-lg overflow-hidden relative"
                    >
                      {m.type === "VIDEO" ? (
                        <video
                          src={m.url}
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image
                          src={m.url}
                          alt="Review media"
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="flex items-center gap-4 pt-4 border-t">
            <span className="text-sm text-gray-600">Was this helpful?</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 h-8"
                disabled={isEditing}
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm">Yes ({review.helpfulCount})</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 h-8"
                disabled={isEditing}
              >
                <ThumbsDown className="w-4 h-4" />
                <span className="text-sm">No</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
