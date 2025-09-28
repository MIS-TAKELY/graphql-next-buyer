import { prisma } from "@/lib/db/prisma";
import { requireBuyer } from "../../auth/auth";
import { GraphQLContext } from "../../context";
import { setCache } from "@/services/redis.services";

export const reviewResolvers = {
  Query: {
    getReview: async (_: any, { id }: { id: string }, ctx: GraphQLContext) => {
      try {
        const review = await prisma.review.findUnique({
          where: { id },
          include: {
            user: true,
            product: true,
            media: true,
            votes: true,
          },
        });
        if (!review) throw new Error("Review not found");
        return review;
      } catch (error: any) {
        console.error("Error fetching review:", error);
        throw new Error(error.message || "Failed to fetch review");
      }
    },

    getReviewsByProductSlug: async (
      _: any,
      {
        slug,
        status,
        page = 1,
        limit = 10,
        sortBy = "createdAt:desc",
      }: {
        slug: string;
        status?: "PENDING" | "APPROVED" | "REJECTED";
        page?: number;
        limit?: number;
        sortBy?: string;
      },
      ctx: GraphQLContext
    ) => {
      try {
        const skip = (page - 1) * limit;
        const [sortField, sortOrder] = sortBy.split(":");

        const validproduct = await prisma.product.findUnique({
          where: {
            slug,
          },
        });

        if (!validproduct) throw new Error("review to non-existing product");

        const productId = validproduct.id;

        // console.log("product id-->", productId);
        // console.log("is valid product-->", validproduct);

        const where: any = { productId };
        if (status) where.status = status;

        const reviews = await prisma.review.findMany({
          where,
          include: {
            user: true,
            product: true,
            media: true,
            votes: true,
          },
          skip,
          take: limit,
          orderBy: {
            [sortField]: sortOrder || "desc",
          },
        });

        return reviews;
      } catch (error: any) {
        console.error("Error fetching reviews by product:", error);
        throw new Error(error.message || "Failed to fetch reviews");
      }
    },

    getReviewsByUser: async (
      _: any,
      {
        userId,
        status,
        page = 1,
        limit = 10,
        sortBy = "createdAt:desc",
      }: {
        userId: string;
        status?: "PENDING" | "APPROVED" | "REJECTED";
        page?: number;
        limit?: number;
        sortBy?: string;
      },
      ctx: GraphQLContext
    ) => {
      try {
        const skip = (page - 1) * limit;
        const [sortField, sortOrder] = sortBy.split(":");

        const where: any = { userId };
        if (status) where.status = status;

        const reviews = await prisma.review.findMany({
          where,
          include: {
            user: true,
            product: true,
            media: true,
            votes: true,
          },
          skip,
          take: limit,
          orderBy: {
            [sortField]: sortOrder || "desc",
          },
        });

        return reviews;
      } catch (error: any) {
        console.error("Error fetching reviews by user:", error);
        throw new Error(error.message || "Failed to fetch reviews");
      }
    },

    getAllReviews: async (
      _: any,
      {
        status,
        page = 1,
        limit = 10,
        sortBy = "createdAt:desc",
      }: {
        status?: "PENDING" | "APPROVED" | "REJECTED";
        page?: number;
        limit?: number;
        sortBy?: string;
      },
      ctx: GraphQLContext
    ) => {
      try {
        const skip = (page - 1) * limit;
        const [sortField, sortOrder] = sortBy.split(":");

        const where: any = {};
        if (status) where.status = status;

        const reviews = await prisma.review.findMany({
          where,
          include: {
            user: true,
            product: true,
            media: true,
            votes: true,
          },
          skip,
          take: limit,
          orderBy: {
            [sortField]: sortOrder || "desc",
          },
        });

        return reviews;
      } catch (error: any) {
        console.error("Error fetching all reviews:", error);
        throw new Error(error.message || "Failed to fetch reviews");
      }
    },
  },

  Mutation: {
    addReview: async (
      _: any,
      {
        input,
      }: {
        input: {
          slug: string;
          rating: number;
          comment?: string;
          media?: { url: string; type: "IMAGE" | "VIDEO" }[]; // Array of media
        };
      },
      ctx: GraphQLContext
    ) => {
      try {
       
        const user = requireBuyer(ctx);
        if (!user) throw new Error("Unauthorized user");

        const userId = user.id;
        const { slug, rating, comment, media } = input;

        if (!userId) throw new Error("Missing user ID in request");
        if (!slug) throw new Error("Missing product slug in request");

        const existingUser = await prisma.user.findUnique({
          where: { id: userId },
        });
        if (!existingUser) throw new Error("User not found");

        const existingProduct = await prisma.product.findUnique({
          where: { slug },
        });
        if (!existingProduct) throw new Error("Product not found");

        const purchase = await prisma.orderItem.findFirst({
          where: {
            order: { buyerId: userId, status: "DELIVERED" },
            variant: { productId: existingProduct.id },
          },
        });
        const verifiedPurchase = !!purchase;
        const orderItemId = purchase?.id || null;

        const review = await prisma.review.create({
          data: {
            userId,
            productId: existingProduct.id,
            rating,
            comment,
            verifiedPurchase,
            orderItemId,
          },
        });

        // Handle multiple media uploads (URLs)
        if (media && media.length > 0) {
          await prisma.reviewMedia.createMany({
            data: media.map((item) => ({
              reviewId: review.id,
              type: item.type,
              url: item.url,
            })),
          });
        }

        // Update Redis cache for this specific product
        const updatedProduct = await prisma.product.findUnique({
          where: { slug },
          include: {
            seller: true,
            variants: {
              include: {
                cartItems: { select: { userId: true, variantId: true } },
              },
            },
            images: true,
            reviews: true,
            category: { include: { children: true, parent: true } },
            brand: true,
            wishlistItems: true,
          },
        });

        if (updatedProduct) {
          await setCache(`product:${slug}`, updatedProduct, 86400);
        }

        return true;
      } catch (error: any) {
        if (error && error.code === "P2002") {
          throw new Error("You have already reviewed this product");
        }
        console.error("Error while adding review:", error);
        throw new Error(error.message || "Failed to add review");
      }
    },

    updateReview: async (
      _: any,
      {
        id,
        input,
      }: {
        id: string;
        input: {
          rating?: number;
          comment?: string;
          media?: { url: string; type: "IMAGE" | "VIDEO" }[];
        };
      },
      ctx: GraphQLContext
    ) => {
      try {
        const user = requireBuyer(ctx);
        if (!user) throw new Error("Unauthorized user");

        const userId = user.id;

        const existingReview = await prisma.review.findUnique({
          where: { id },
        });
        if (!existingReview) throw new Error("Review not found");
        if (existingReview.userId !== userId)
          throw new Error("You can only edit your own reviews");

        const updatedReview = await prisma.review.update({
          where: { id },
          data: {
            rating: input.rating,
            comment: input.comment,
          },
        });

        // Handle multiple media: Delete existing and add new
        if (input.media) {
          await prisma.reviewMedia.deleteMany({ where: { reviewId: id } });
          if (input.media.length > 0) {
            await prisma.reviewMedia.createMany({
              data: input.media.map((item) => ({
                reviewId: id,
                type: item.type,
                url: item.url,
              })),
            });
          }
        }

        return updatedReview;
      } catch (error: any) {
        console.error("Error while updating review:", error);
        throw new Error(error.message || "Failed to update review");
      }
    },

    deleteReview: async (
      _: any,
      { id }: { id: string },
      ctx: GraphQLContext
    ) => {
      try {
        const user = requireBuyer(ctx);
        if (!user) throw new Error("Unauthorized user");

        const userId = user.id;

        const existingReview = await prisma.review.findUnique({
          where: { id },
        });
        if (!existingReview) throw new Error("Review not found");
        if (existingReview.userId !== userId)
          throw new Error("You can only delete your own reviews");

        await prisma.reviewMedia.deleteMany({ where: { reviewId: id } });
        await prisma.reviewVote.deleteMany({ where: { reviewId: id } });
        await prisma.review.delete({ where: { id } });

        return true;
      } catch (error: any) {
        console.error("Error while deleting review:", error);
        throw new Error(error.message || "Failed to delete review");
      }
    },
  },

  Review: {
    user: async (parent: { userId: string }) => {
      return prisma.user.findUnique({ where: { id: parent.userId } });
    },
    product: async (parent: { productId: string }) => {
      return prisma.product.findUnique({ where: { id: parent.productId } });
    },
    media: async (parent: { id: string }) => {
      return prisma.reviewMedia.findMany({ where: { reviewId: parent.id } });
    },
    votes: async (parent: { id: string }) => {
      return prisma.reviewVote.findMany({ where: { reviewId: parent.id } });
    },
  },

  ReviewVote: {
    review: async (parent: { reviewId: string }) => {
      return prisma.review.findUnique({ where: { id: parent.reviewId } });
    },
    user: async (parent: { userId: string }) => {
      return prisma.user.findUnique({ where: { id: parent.userId } });
    },
  },
};
