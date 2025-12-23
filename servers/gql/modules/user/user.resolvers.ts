import { Gender } from "../../../../app/generated/prisma";
import { prisma } from "../../../../lib/db/prisma";
import { requireAuth } from "../../auth/auth";
import { GraphQLContext } from "../../context";

export const userResolvers = {
  Query: {
    getUserProfileDetails: async (_: any, __: any, ctx: GraphQLContext) => {
      try {
        const user = requireAuth(ctx);
        if (!user || !user.id) throw new Error("Unauthorized user: missing ID");
        const userId = user.id;
        return prisma.user.findUnique({
          where: {
            id: userId,
          },
          include: {
            addresses: true,
            roles: true,
            // paymentMethods: true,
            // cartItems: true,
            orders: true,
            reviews: true,
            products: true,
            // payouts: true,
            sellerOrders: true,
            wishlists: true,
          },
        });
      } catch (error: any) {
        console.log("error while fetching user profile details", error.message);
        console.error(error);
        throw new Error(error.message);
      }
    },
  },
  Mutation: {
    updateUserProfileDetails: async (
      _: any,
      {
        input,
      }: {
        input: {
          firstName?: string;
          lastName?: string;
          phone?: string;
          gender: Gender;
          dob: Date;
        };
      },
      ctx: GraphQLContext
    ) => {
      try {
        const user = requireAuth(ctx);
        if (!user || !user.id) throw new Error("Unauthorized User: missing ID");
        const userId = user.id;

        const data: Record<string, any> = {};
        Object.entries(input).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (typeof value === "string" && value.trim() !== "") {
              data[key] = value.trim();
            } else {
              data[key] = value;
            }
          }
        });

        return prisma.user.update({
          where: { id: userId },
          data,
        });
      } catch (error: any) {
        console.log("error while updating user profile details", error.message);
        throw new Error(error.message);
      }
    },
  },
};
