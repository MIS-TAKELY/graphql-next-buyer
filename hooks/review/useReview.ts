import {
  ADD_REVIEW,
  DELETE_REVIEW,
  UPDATE_REVIEW,
} from "@/client/review/reviews.mutation";
import {
  GET_REVIEWS_BY_PRODUCT_BY_SLUG,
  GET_REVIEW_STATS,
} from "@/client/review/reviews.query";
import { Review } from "@/components/review/types";
import { useMutation, useQuery } from "@apollo/client";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";

// Assuming we have a way to get the current user ID
// You might need to adjust this based on your auth implementation

export const useReview = () => {
  const params = useParams();
  const productSlug = params.slug as string;
  const [filterRating, setFilterRating] = useState<number | undefined>(undefined);
  const [limit] = useState(5);
  // Using Apollo's fetchMore for pagination, so we don't need manual page state management for the query itself usually,
  // but we might want to track if there are more items.

  const { data, loading, refetch, fetchMore } = useQuery(GET_REVIEWS_BY_PRODUCT_BY_SLUG, {
    variables: { slug: productSlug, rating: filterRating, offset: 0, limit },
    skip: !productSlug,
    fetchPolicy: "cache-and-network",
  });

  const loadMore = async () => {
    if (!data?.getReviewsByProductSlug) return;

    // Calculate current length based on actual data
    const currentLength = data.getReviewsByProductSlug.length;

    await fetchMore({
      variables: {
        offset: currentLength,
        limit,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          getReviewsByProductSlug: [
            ...prev.getReviewsByProductSlug,
            ...fetchMoreResult.getReviewsByProductSlug,
          ],
        };
      },
    });
  };

  const { data: statsData, loading: statsLoading } = useQuery(GET_REVIEW_STATS, {
    variables: { slug: productSlug },
    skip: !productSlug,
  });

  const [addReviewMutation, { loading: addLoading }] = useMutation(ADD_REVIEW);

  const [updateReviewMutation, { loading: updateLoading }] =
    useMutation(UPDATE_REVIEW);

  const [deleteReviewMutation, { loading: deleteLoading }] =
    useMutation(DELETE_REVIEW);

  const addReview = async (payload: {
    rating: number;
    comment: string;
    media?: Array<{
      url: string;
      type: "IMAGE" | "VIDEO";
      status?: "uploading" | "uploaded" | "error";
    }>;
  }) => {
    // Block if any uploads still pending
    if (payload.media?.some((m) => m.status === "uploading")) {
      throw new Error("Please wait until all media uploads finish.");
    }

    // Filter out failed uploads - only include successfully uploaded media
    const successfulMedia =
      payload.media?.filter((m) => m.status === "uploaded" || !m.status) ?? [];

    console.log("hook media-->", successfulMedia);

    // Create optimistic review with a temporary ID
    const tempId = `optimistic-${Date.now()}`;

    try {
      // Execute the mutation with optimistic response
      const result = await addReviewMutation({
        variables: {
          input: {
            slug: productSlug,
            rating: payload.rating,
            comment: payload.comment,
            media: successfulMedia.map(({ url, type }) => ({ url, type })),
          },
        },
        optimisticResponse: {
          addReview: true, // The mutation returns a boolean
        },
        update: (cache) => {
          // Read existing reviews from cache
          const existing: any = cache.readQuery({
            query: GET_REVIEWS_BY_PRODUCT_BY_SLUG,
            variables: { slug: productSlug, rating: filterRating, offset: 0, limit },
          });

          if (!existing?.getReviewsByProductSlug) {
            console.warn("No reviews found in cache for slug:", productSlug);
            return;
          }

          // Create optimistic review object
          const optimisticReview = {
            __typename: "Review",
            id: tempId,
            rating: payload.rating,
            comment: payload.comment,
            user: {
              __typename: "User",
              id: "current-user",
              firstName: "You",
              lastName: "",
            },
            media: successfulMedia.map((m, index) => ({
              __typename: "ReviewMedia",
              id: `optimistic-media-${Date.now()}-${index}`,
              reviewId: tempId,
              url: m.url,
              type: m.type,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: "PENDING",
            verifiedPurchase: false,
            isFeatured: false,
            helpfulCount: 0,
            votes: [],
          };

          // Write updated reviews to cache
          cache.writeQuery({
            query: GET_REVIEWS_BY_PRODUCT_BY_SLUG,
            variables: { slug: productSlug, rating: filterRating, offset: 0, limit },
            data: {
              getReviewsByProductSlug: [optimisticReview, ...existing.getReviewsByProductSlug],
            },
          });
        },
      });

      console.log("Review submitted successfully:", result);
      // Refetch to get the real review from server
      await refetch();
      return result;
    } catch (error) {
      console.error("Review submission error:", error);
      // Apollo automatically reverts the optimistic update on error
      throw error;
    }
  };

  const updateReview = async (
    id: string,
    payload: {
      rating?: number;
      comment?: string;
      media?: Array<{
        url: string;
        type: "IMAGE" | "VIDEO";
        status?: "uploading" | "uploaded" | "error";
      }>;
    }
  ) => {
    // Find the current review for fallback values
    const currentReview = data?.getReviewsByProductSlug.find(
      (rev: Review) => rev.id === id
    );

    // Build input
    const successfulMedia = payload.media?.filter(
      (m) => m.status === "uploaded" || !m.status
    );

    const input: any = {};
    if (payload.rating !== undefined) input.rating = payload.rating;
    if (payload.comment !== undefined) input.comment = payload.comment;
    if (payload.media !== undefined && successfulMedia) {
      input.media = successfulMedia.map(({ url, type }) => ({ url, type }));
    }

    try {
      const result = await updateReviewMutation({
        variables: { id, input },
        optimisticResponse: {
          updateReview: {
            __typename: "Review",
            id,
            rating: input.rating ?? currentReview?.rating ?? 0,
            comment: input.comment ?? currentReview?.comment ?? "",
            media:
              input.media?.map((m: any, idx: number) => ({
                __typename: "ReviewMedia",
                id: `temp-${id}-${idx}`,
                url: m.url,
                type: m.type,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })) ??
              currentReview?.media ??
              [],
            user: {
              __typename: "User",
              id: currentReview?.user?.id ?? "current-user",
              firstName: currentReview?.user?.firstName ?? "You",
              lastName: currentReview?.user?.lastName ?? "",
            },
            createdAt: currentReview?.createdAt ?? new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: currentReview?.status ?? "PENDING",
            verifiedPurchase: currentReview?.verifiedPurchase ?? false,
            isFeatured: currentReview?.isFeatured ?? false,
            helpfulCount: currentReview?.helpfulCount ?? 0,
            votes: currentReview?.votes ?? [],
          },
        },
        update: (cache, { data }) => {
          if (!data?.updateReview) return;

          const existing: any = cache.readQuery({
            query: GET_REVIEWS_BY_PRODUCT_BY_SLUG,
            variables: { slug: productSlug, rating: filterRating, offset: 0, limit },
          });

          if (!existing?.getReviewsByProductSlug) {
            console.warn("No reviews found in cache for slug:", productSlug);
            return;
          }

          cache.writeQuery({
            query: GET_REVIEWS_BY_PRODUCT_BY_SLUG,
            variables: { slug: productSlug, rating: filterRating, offset: 0, limit }, // Ensure consistent variables
            data: {
              getReviewsByProductSlug: existing.getReviewsByProductSlug.map(
                (rev: any) =>
                  rev.id === id ? { ...rev, ...data.updateReview } : rev
              ),
            },
          });
        },
      });

      return result;
    } catch (error) {
      // Apollo automatically reverts the optimistic update on error
      throw error;
    }
  };

  const removeReview = async (id: string) => {
    return deleteReviewMutation({
      variables: { id },

      // ✅ Delete instantly
      optimisticResponse: {
        deleteReview: true, // match your schema
      },

      update: (cache) => {
        const existing: any = cache.readQuery({
          query: GET_REVIEWS_BY_PRODUCT_BY_SLUG,
          variables: { slug: productSlug, rating: filterRating, offset: 0, limit }, // Ensure consistent variables
        });

        if (existing) {
          cache.writeQuery({
            query: GET_REVIEWS_BY_PRODUCT_BY_SLUG,
            variables: { slug: productSlug, rating: filterRating, offset: 0, limit }, // Ensure consistent variables
            data: {
              getReviewsByProductSlug: existing.getReviewsByProductSlug.filter(
                (rev: any) => rev.id !== id
              ),
            },
          });
        }
      },
    });
  };

  // Return data directly from Apollo cache
  const reviews = data?.getReviewsByProductSlug || [];

  return {
    data: reviews,
    stats: statsData?.getReviewStats,
    loading,
    statsLoading,
    addReview,
    updateReview,
    removeReview,
    refetch,
    loadMore,
    hasMore: true, // Always allow loading more for now until we have proper total count vs current count check or similar mechanism
    isAdding: addLoading,
    isUpdating: updateLoading,
    isDeleting: deleteLoading,
    filterRating,
    setFilterRating,
  };
};
