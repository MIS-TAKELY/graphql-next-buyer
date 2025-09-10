import { prisma } from "@/lib/db/prisma";
import { requireBuyer } from "../../auth/auth";
import { GraphQLContext } from "../../context";

export const reviewResolvers = {
  Query: {},
  Mutation: {
    addReview: async (
      _: any,
      { input }: { input: any },
      ctx: GraphQLContext
    ) => {
      try {
        const user = requireBuyer(ctx);
        if (!user) throw new Error("unauthorize user");

        const userId = input.userId;
        const productId = input.productId;

        if (!userId) throw new Error("Missing user id in request");

        if (!productId) throw new Error("Missing product id in request");

        const isValidUser = await prisma.user.findUnique({
          where: { id: userId },
        });

        console.log(isValidUser);

        const isValidProduct = await prisma.product.findUnique({
          where: { id: productId },
        });

        console.log(isValidProduct);

        return prisma.review.create({
          data: input,
        });
      } catch (error: any) {
        console.log("error while adding review", error);
        console.error(error.message);
      }
    },
  },
};
