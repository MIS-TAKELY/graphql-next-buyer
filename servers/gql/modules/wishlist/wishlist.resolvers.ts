// server/wishlist/wishlist.resolvers.ts
import { prisma } from "../../../../lib/db/prisma";
import { requireBuyer } from "../../auth/auth";
import { GraphQLContext } from "../../context";

const PRODUCT_SELECT = {
  id: true,
  name: true,
  variants: {
    select: {
      id: true,
      price: true,
      mrp: true,
      stock: true,
    },
  },
  images: {
    select: {
      url: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: "asc" },
  },
} as const;

export const wishlistResolvers = {
  Query: {
    myWishlists: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireBuyer(context);

      return prisma.wishlist.findMany({
        where: { userId: user.id },
        include: {
          items: {
            include: {
              product: {
                select: PRODUCT_SELECT,
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    },

    wishlistItems: async (
      _: any,
      { wishlistId }: { wishlistId: string },
      context: GraphQLContext
    ) => {
      const user = requireBuyer(context);

      return prisma.wishlistItem.findMany({
        where: {
          wishlistId,
          wishlist: { userId: user.id },
        },
        include: {
          product: {
            select: PRODUCT_SELECT,
          },
        },
      });
    },
  },

  Mutation: {
    addToWishlist: async (
      _: any,
      { productId, wishlistId }: { productId: string; wishlistId?: string },
      context: GraphQLContext
    ) => {
      const user = requireBuyer(context);

      // Use transaction for atomicity
      return prisma.$transaction(
        async (tx: any) => {
          let wishlist;

          if (wishlistId) {
            wishlist = await tx.wishlist.findFirst({
              where: { id: wishlistId, userId: user.id },
            });
          } else {
            wishlist = await tx.wishlist.findFirst({
              where: { userId: user.id, name: "My Wishlist" },
            });
          }

          if (!wishlist) {
            wishlist = await tx.wishlist.create({
              data: {
                name: "My Wishlist",
                userId: user.id,
              },
            });
          }

          // Check for existing item
          const existing = await tx.wishlistItem.findUnique({
            where: {
              wishlistId_productId: {
                wishlistId: wishlist.id,
                productId,
              },
            },
            include: {
              product: {
                select: PRODUCT_SELECT,
              },
            },
          });

          if (existing) return existing;

          return tx.wishlistItem.create({
            data: {
              wishlistId: wishlist.id,
              productId,
            },
            include: {
              product: {
                select: PRODUCT_SELECT,
              },
            },
          });
        },
        {
          timeout: 10000,
        }
      );
    },

    removeFromWishlist: async (
      _: any,
      { wishlistId, productId }: { wishlistId: string; productId: string },
      context: GraphQLContext
    ) => {
      const user = requireBuyer(context);

      try {
        await prisma.wishlistItem.delete({
          where: {
            wishlistId_productId: {
              wishlistId,
              productId,
            },
            wishlist: {
              userId: user.id,
            },
          },
        });
        return true;
      } catch (error: any) {
        if (error) {
          if (error.code === "P2025") {
            throw new Error("Wishlist item not found or not authorized");
          }
        }
        throw error;
      }
    },
  },
};
