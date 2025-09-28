import { ADD_REVIEW } from "@/client/review/reviews.mutation";
import { GET_REVIEWS_BY_PRODUCT_BY_SLUG } from "@/client/review/reviews.query";
import { useMutation, useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { useState } from "react";

export const useReview = () => {
  const params = useParams();
  const productSlug = params.slug as string;
  const [optimisticReviews, setOptimisticReviews] = useState<any[]>([]);

  const { data, loading, refetch } = useQuery(GET_REVIEWS_BY_PRODUCT_BY_SLUG, {
    variables: { slug: productSlug },
    skip: !productSlug,
  });

  const [addReviewMutation, { loading: mutationLoading }] = useMutation(
    ADD_REVIEW,
    {
      onCompleted: (result) => {
        console.log("Review submitted successfully:", result);
        // Don't clear optimistic reviews immediately - let them stay until refetch
        refetch().then(() => {
          // Only clear optimistic reviews after successful refetch
          setOptimisticReviews([]);
        });
      },
      onError: (error) => {
        console.error("Review submission error:", error);
        // Remove the optimistic review on error
        setOptimisticReviews([]);
      },
    }
  );

  const addReview = async (payload: {
    rating: number;
    comment: string;
    media: Array<{ url: string; type: "IMAGE" | "VIDEO"; status?: "uploading" | "uploaded" | "error" }>;
  }) => {
    // Block if any uploads still pending
    if (payload.media?.some((m) => m.status === "uploading")) {
      throw new Error("Please wait until all media uploads finish.");
    }

    // Filter out failed uploads - only include successfully uploaded media
    const successfulMedia = payload.media.filter((m) => m.status === "uploaded" || !m.status);

    console.log("hook media-->", successfulMedia);

    // Create optimistic review with a temporary ID
    const optimisticReview = {
      id: `optimistic-${Date.now()}`,
      rating: payload.rating,
      comment: payload.comment,
      user: { 
        id: 'current-user',
        firstName: "You", 
        lastName: "" 
      },
      media: successfulMedia.map((m, index) => ({
        id: `optimistic-media-${Date.now()}-${index}`,
        reviewId: `optimistic-${Date.now()}`,
        url: m.url,
        type: m.type,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "PENDING",
      verifiedPurchase: false,
      isFeatured: false,
      helpfulCount: 0,
      votes: [],
      isOptimistic: true, // Flag to identify optimistic reviews
    };

    // Add optimistic review immediately for instant UI feedback
    setOptimisticReviews((prev) => [optimisticReview, ...prev]);

    try {
      // Execute the mutation (this can take time, but UI already shows the review)
      const result = await addReviewMutation({
        variables: {
          input: {
            slug: productSlug,
            rating: payload.rating,
            comment: payload.comment,
            media: successfulMedia.map(({ url, type }) => ({ url, type })),
          },
        },
      });

      return result;
    } catch (error) {
      throw error;
    }
  };

  // Combine optimistic reviews with real reviews
  // Put optimistic reviews first so they appear at the top
  const allReviews = [
    ...optimisticReviews,
    ...(data?.getReviewsByProductSlug || []),
  ];

  return {
    data: allReviews,
    loading: loading && optimisticReviews.length === 0, // Don't show loading if we have optimistic reviews
    addReview,
    refetch,
    isSubmitting: mutationLoading,
  };
};