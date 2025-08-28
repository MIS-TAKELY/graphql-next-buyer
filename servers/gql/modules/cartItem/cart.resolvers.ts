import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "../../auth/auth";
import { GraphQLContext } from "../../context";

export const cartItemResolvers = {
  Query: {
    getCarts: async (_: any, __: any, ctx: GraphQLContext) => {
      try {
        requireAuth(ctx);

        return await prisma.cartItem.findMany({
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true }, // Only select needed fields
            },
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: {
                      select: { url: true, altText: true },
                      take: 1, // Only get first image for performance
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" }, // Show latest items first
        });
      } catch (error: any) {
        console.error("Error fetching carts:", error);
        throw new Error(`Failed to fetch cart items: ${error.message}`);
      }
    },

    getMyCart: async (_: any, __: any, ctx: GraphQLContext) => {
      try {
        const user = requireAuth(ctx);

        return await prisma.cartItem.findMany({
          where: { userId: user.id },
          include: {
            user: {
              select: { id: true, firstName: true },
            },
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    images: {
                      select: { url: true, altText: true },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
      } catch (error: any) {
        console.error("Error fetching user cart:", error);
        throw new Error(`Failed to fetch cart items: ${error.message}`);
      }
    },
  },

  Mutation: {
    addToCart: async (
      _: any,
      { variantId, quantity }: { variantId: string; quantity: number },
      ctx: GraphQLContext
    ) => {
      try {
        const user = requireAuth(ctx);

        // Validate inputs
        if (!variantId) {
          throw new Error("Variant ID is required");
        }

        if (!quantity || quantity < 1) {
          throw new Error("Quantity must be at least 1");
        }

        // Check if variant exists and is available
        const variant = await prisma.productVariant.findUnique({
          where: { id: variantId },
          include: {
            product: {
              select: { id: true, name: true, status: true },
            },
          },
        });

        if (!variant) {
          throw new Error("Product variant not found");
        }

        // Check stock if applicable
        if (variant.stock !== null && variant.stock < quantity) {
          throw new Error("Insufficient stock available");
        }

        // Check if product is active
        if (variant.product.status !== "ACTIVE") {
          throw new Error("Product is not available");
        }

        // Use upsert for better performance and atomicity
        await prisma.cartItem.upsert({
          where: {
            userId_variantId: {
              userId: user.id,
              variantId,
            },
          },
          update: {
            quantity: {
              increment: quantity,
            },
          },
          create: {
            userId: user.id,
            variantId,
            quantity,
          },
        });

        return true;
      } catch (error: any) {
        console.error("Error adding to cart:", error);

        // Re-throw Apollo errors as-is
        if (error instanceof Error) {
          throw error;
        }

        throw new Error(`Failed to add item to cart: ${error.message}`);
      }
    },

    removeFromCart: async (
      _: any,
      { variantId }: { variantId: string },
      ctx: GraphQLContext
    ) => {
      try {
        const user = requireAuth(ctx);

        if (!variantId) {
          throw new Error("Variant ID is required");
        }

        // Find the cart item first
        const cartItem = await prisma.cartItem.findFirst({
          where: {
            variantId,
            userId: user.id,
          },
        });

        if (!cartItem) {
          throw new Error("Item not found in cart");
        }

        // Delete the cart item
        await prisma.cartItem.delete({
          where: { id: cartItem.id },
        });

        return true;
      } catch (error: any) {
        console.error("Error removing from cart:", error);

        if (error instanceof Error) {
          throw error;
        }

        throw new Error(`Failed to remove item from cart: ${error.message}`);
      }
    },

    updateCartQuantity: async (
      _: any,
      { variantId, quantity }: { variantId: string; quantity: number },
      ctx: GraphQLContext
    ) => {
      try {
        const user = requireAuth(ctx);

        if (!variantId) {
          throw new Error("Variant ID is required");
        }

        if (quantity < 0) {
          throw new Error("Quantity cannot be negative");
        }

        // If quantity is 0, remove the item
        if (quantity === 0) {
          const cartItem = await prisma.cartItem.findFirst({
            where: { variantId, userId: user.id },
          });

          if (cartItem) {
            await prisma.cartItem.delete({
              where: { id: cartItem.id },
            });
          }
          return true;
        }

        // Check stock if applicable
        const variant = await prisma.productVariant.findUnique({
          where: { id: variantId },
        });

        if (!variant) {
          throw new Error("Product variant not found");
        }

        if (variant.stock !== null && variant.stock < quantity) {
          throw new Error("Insufficient stock available");
        }

        // Update quantity
        await prisma.cartItem.updateMany({
          where: {
            variantId,
            userId: user.id,
          },
          data: { quantity },
        });

        return true;
      } catch (error: any) {
        console.error("Error updating cart quantity:", error);

        if (error instanceof Error) {
          throw error;
        }

        throw new Error(`Failed to update cart quantity: ${error.message}`);
      }
    },

    clearCart: async (_: any, __: any, ctx: GraphQLContext) => {
      try {
        const user = requireAuth(ctx);

        await prisma.cartItem.deleteMany({
          where: { userId: user.id },
        });

        return true;
      } catch (error: any) {
        console.error("Error clearing cart:", error);
        throw new Error(`Failed to clear cart: ${error.message}`);
      }
    },
  },
};
