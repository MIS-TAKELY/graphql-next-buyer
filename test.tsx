import { gql } from "graphql-tag";

export const reviewTypeDefs = gql`
  scalar DateTime

  enum ReviewStatus {
    PENDING
    APPROVED
    REJECTED
  }

  enum MediaType {
    IMAGE
    VIDEO
  }

  type Review {
    id: ID!
    userId: String!
    productId: String!
    rating: Int!
    comment: String
    status: ReviewStatus
    isFeatured: Boolean
    helpfulCount: Int
    verifiedPurchase: Boolean
    orderItemId: String
    createdAt: DateTime!
    updatedAt: DateTime!
    user: User
    product: Product!
    media: [ReviewMedia]
    votes: [ReviewVote]
  }

  type ReviewMedia {
    id: ID!
    reviewId: String!
    url: String!
    type: MediaType!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ReviewVote {
    id: ID!
    reviewId: String
    userId: String
    vote: Int
    review: Review
    user: User
  }

  input ReviewMediaInput {
    url: String!
    type: MediaType!
  }

  input AddReviewInput {
    slug: String!
    rating: Int!
    comment: String
    media: [ReviewMediaInput]
  }

  input UpdateReviewInput {
    rating: Int
    comment: String
    media: [ReviewMediaInput]
  }

  type Query {
    getReview(id: ID!): Review
    getReviewsByProductSlug(
      slug: String!
      status: ReviewStatus
      page: Int
      limit: Int
      sortBy: String
    ): [Review]
    getReviewsByUser(
      userId: String!
      status: ReviewStatus
      page: Int
      limit: Int
      sortBy: String
    ): [Review]
    getAllReviews(
      status: ReviewStatus
      page: Int
      limit: Int
      sortBy: String
    ): [Review]
  }

  type Mutation {
    addReview(input: AddReviewInput!): Boolean
    updateReview(id: ID!, input: UpdateReviewInput!): Boolean
    deleteReview(id: ID!): Boolean
  }
`;
 import { ADD_REVIEW } from "@/client/review/reviews.mutation";
import { GET_REVIEWS_BY_PRODUCT_BY_SLUG } from "@/client/review/reviews.query";
import { useMutation, useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { gql } from "graphql-tag";

const UPDATE_REVIEW = gql`
  mutation UpdateReview($id: ID!, $input: UpdateReviewInput!) {
    updateReview(id: $id, input: $input)
  }
`;

const DELETE_REVIEW = gql`
  mutation DeleteReview($id: ID!) {
    deleteReview(id: $id)
  }
`;

export const useReview = () => {
  const params = useParams();
  const productSlug = params.slug as string;
  const [optimisticAdds, setOptimisticAdds] = useState<any[]>([]);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, any>>({});
  const [optimisticDeletes, setOptimisticDeletes] = useState<Set<string>>(new Set());

  const { data, loading, refetch } = useQuery(GET_REVIEWS_BY_PRODUCT_BY_SLUG, {
    variables: { slug: productSlug },
    skip: !productSlug,
    fetchPolicy: "cache-first"
  });

  const [addReviewMutation, { loading: addLoading }] = useMutation(ADD_REVIEW);

  const [updateReviewMutation, { loading: updateLoading }] = useMutation(UPDATE_REVIEW);

  const [deleteReviewMutation, { loading: deleteLoading }] = useMutation(DELETE_REVIEW);

  const addReview = async (payload: {
    rating: number;
    comment: string;
    media?: Array<{ url: string; type: "IMAGE" | "VIDEO"; status?: "uploading" | "uploaded" | "error" }>;
  }) => {
    // Block if any uploads still pending
    if (payload.media?.some((m) => m.status === "uploading")) {
      throw new Error("Please wait until all media uploads finish.");
    }

    // Filter out failed uploads - only include successfully uploaded media
    const successfulMedia = payload.media?.filter((m) => m.status === "uploaded" || !m.status) ?? [];

    console.log("hook media-->", successfulMedia);

    // Create optimistic review with a temporary ID
    const tempId = `optimistic-${Date.now()}`;
    const optimisticReview = {
      id: tempId,
      rating: payload.rating,
      comment: payload.comment,
      user: { 
        id: 'current-user',
        firstName: "You", 
        lastName: "" 
      },
      media: successfulMedia.map((m, index) => ({
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
      isOptimistic: true, // Flag to identify optimistic reviews
    };

    // Add optimistic review immediately for instant UI feedback
    setOptimisticAdds((prev) => [optimisticReview, ...prev]);

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

      console.log("Review submitted successfully:", result);
      await refetch();
      setOptimisticAdds((prev) => prev.filter((r) => r.id !== tempId));
      return result;
    } catch (error) {
      console.error("Review submission error:", error);
      setOptimisticAdds((prev) => prev.filter((r) => r.id !== tempId));
      throw error;
    }
  };

  const updateReview = async (
    id: string,
    payload: {
      rating?: number;
      comment?: string;
      media?: Array<{ url: string; type: "IMAGE" | "VIDEO"; status?: "uploading" | "uploaded" | "error" }>;
    }
  ) => {
    // Block if any uploads still pending
    if (payload.media?.some((m) => m.status === "uploading")) {
      throw new Error("Please wait until all media uploads finish.");
    }

    // Filter out failed uploads - only include successfully uploaded media
    const successfulMedia = payload.media?.filter((m) => m.status === "uploaded" || !m.status);

    // Build optimistic update object (only include provided fields)
    const optimisticUpdate: any = {
      updatedAt: new Date().toISOString(),
    };
    if (payload.rating !== undefined) optimisticUpdate.rating = payload.rating;
    if (payload.comment !== undefined) optimisticUpdate.comment = payload.comment;
    if (payload.media !== undefined && successfulMedia) {
      // If media is provided (even empty array), replace existing media
      optimisticUpdate.media = successfulMedia.map((m, index) => ({
        id: `optimistic-media-update-${Date.now()}-${index}`,
        reviewId: id,
        url: m.url,
        type: m.type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }

    // Apply optimistic update
    setOptimisticUpdates((prev) => ({ ...prev, [id]: optimisticUpdate }));

    try {
      // Build input for mutation (only include provided fields)
      const input: any = {};
      if (payload.rating !== undefined) input.rating = payload.rating;
      if (payload.comment !== undefined) input.comment = payload.comment;
      if (payload.media !== undefined && successfulMedia) {
        input.media = successfulMedia.map(({ url, type }) => ({ url, type }));
      }

      const result = await updateReviewMutation({
        variables: {
          id,
          input,
        },
      });

      console.log("Review updated successfully:", result);
      await refetch();
      setOptimisticUpdates((prev) => {
        const newUpdates = { ...prev };
        delete newUpdates[id];
        return newUpdates;
      });
      return result;
    } catch (error) {
      console.error("Review update error:", error);
      setOptimisticUpdates((prev) => {
        const newUpdates = { ...prev };
        delete newUpdates[id];
        return newUpdates;
      });
      throw error;
    }
  };

  const removeReview = async (id: string) => {
    // Apply optimistic delete
    setOptimisticDeletes((prev) => new Set([...prev, id]));

    try {
      const result = await deleteReviewMutation({
        variables: {
          id,
        },
      });

      console.log("Review deleted successfully:", result);
      await refetch();
      setOptimisticDeletes((prev) => {
        const newDeletes = new Set(prev);
        newDeletes.delete(id);
        return newDeletes;
      });
      return result;
    } catch (error) {
      console.error("Review deletion error:", error);
      setOptimisticDeletes((prev) => {
        const newDeletes = new Set(prev);
        newDeletes.delete(id);
        return newDeletes;
      });
      throw error;
    }
  };

  // Combine optimistic adds, updates, and deletes with real reviews
  const baseReviews = data?.getReviewsByProductSlug || [];
  const filteredReviews = baseReviews.filter((review) => !optimisticDeletes.has(review.id));
  const updatedReviews = filteredReviews.map((review) => {
    const update = optimisticUpdates[review.id];
    if (update) {
      return { ...review, ...update };
    }
    return review;
  });
  const allReviews = [...optimisticAdds, ...updatedReviews];

  return {
    data: allReviews,
    loading: loading && optimisticAdds.length === 0,
    addReview,
    updateReview,
    removeReview,
    refetch,
    isAdding: addLoading,
    isUpdating: updateLoading,
    isDeleting: deleteLoading,
  };
};