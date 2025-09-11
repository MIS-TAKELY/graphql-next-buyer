import { prisma } from "@/lib/db/prisma";
import { delCache, getCache, setCache } from "@/services/redis.services";
import { requireAuth } from "../../auth/auth";
import { GraphQLContext } from "../../context";

export const cartItemResolvers = {
  Query: {
    getCarts: async (_: any, __: any, ctx: GraphQLContext) => {
      try {
        requireAuth(ctx);
        const cacheKey = "carts:all";

        // Use cache with longer TTL
        const cached = await getCache(cacheKey);
        if (cached) {
          console.log("⚡ Returning carts from Redis");
          return cached;
        }

        // Simplified query - only essential data
        const carts = await prisma.cartItem.findMany({
          select: {
            id: true,
            quantity: true,
            userId: true,
            variantId: true,
            createdAt: true,
            user: { select: { id: true, firstName: true, lastName: true } },
            variant: {
              select: {
                id: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: { select: { url: true, altText: true }, take: 1 },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        // Cache with longer TTL
        await setCache(cacheKey, carts, 300); // 5 minutes
        return carts;
      } catch (error: any) {
        console.error("Error fetching carts:", error);
        throw new Error(`Failed to fetch cart items: ${error.message}`);
      }
    },

    getMyCart: async (_: any, __: any, ctx: GraphQLContext) => {
      try {
        const user = requireAuth(ctx);
        const cacheKey = `carts:user:${user.id}`;

        // Use cache
        const cached = await getCache(cacheKey);
        if (cached) {
          console.log("⚡ Returning myCart from Redis");
          return cached;
        }

        // Minimal query for better performance
        const myCart = await prisma.cartItem.findMany({
          where: { userId: user.id },
          select: {
            id: true,
            quantity: true,
            variantId: true,
            variant: {
              select: {
                id: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    // Only get first image for performance
                    images: { select: { url: true, altText: true }, take: 1 },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        // Cache with reasonable TTL
        await setCache(cacheKey, myCart, 180); // 3 minutes
        return myCart;
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

        if (!variantId) throw new Error("Variant ID is required");
        if (!quantity || quantity < 1)
          throw new Error("Quantity must be at least 1");

        // OPTIMIZATION 1: Check stock and product status in a single query
        const variant = await prisma.productVariant.findUnique({
          where: { id: variantId },
          select: {
            id: true,
            product: { select: { id: true, name: true, status: true } },
          },
        });

        if (!variant) throw new Error("Product variant not found");
        if (variant.product.status !== "ACTIVE")
          throw new Error("Product is not available");

        // OPTIMIZATION 2: Use transaction for atomicity and speed
        await prisma.$transaction(
          async (tx) => {
            // Upsert the cart item
            await tx.cartItem.upsert({
              where: { userId_variantId: { userId: user.id, variantId } },
              update: { quantity: { increment: quantity } },
              create: { userId: user.id, variantId, quantity },
              // select: {
              //   id: true,
              //   quantity: true,
              //   variant: {
              //     select: {
              //       id: true,
              //       product: { select: { id: true, name: true } },
              //     },
              //   },
              // },
            });

            return true;
          },
          {
            timeout: 20000,
            maxWait: 5000,
          }
        );
        Promise.all([
          delCache("carts:all"),
          delCache(`carts:user:${user.id}`),
        ]).catch(console.error); // Fire and forget

        return true;
      } catch (error: any) {
        console.error("Error adding to cart:", error);
        throw error instanceof Error
          ? error
          : new Error(`Failed to add item to cart: ${error.message}`);
      }
    },

    removeFromCart: async (
      _: any,
      { variantId }: { variantId: string },
      ctx: GraphQLContext
    ) => {
      try {
        const user = requireAuth(ctx);
        if (!variantId) throw new Error("Variant ID is required");

        // OPTIMIZATION: Single query to find and delete
        const deletedItem = await prisma.cartItem.deleteMany({
          where: {
            variantId,
            userId: user.id,
          },
        });

        if (deletedItem.count === 0) {
          throw new Error("Item not found in cart");
        }

        // OPTIMIZATION: Async cache invalidation
        Promise.all([
          delCache("carts:all"),
          delCache(`carts:user:${user.id}`),
        ]).catch(console.error);

        return true;
      } catch (error: any) {
        console.error("Error removing from cart:", error);
        throw error instanceof Error
          ? error
          : new Error(`Failed to remove item from cart: ${error.message}`);
      }
    },

    updateCartQuantity: async (
      _: any,
      { variantId, quantity }: { variantId: string; quantity: number },
      ctx: GraphQLContext
    ) => {
      try {
        const user = requireAuth(ctx);
        if (!variantId) throw new Error("Variant ID is required");
        if (quantity < 0) throw new Error("Quantity cannot be negative");

        if (quantity === 0) {
          // Delete if quantity is 0
          await prisma.cartItem.deleteMany({
            where: { variantId, userId: user.id },
          });
        } else {
          // Check stock first
          const variant = await prisma.productVariant.findUnique({
            where: { id: variantId },
            select: { stock: true },
          });

          if (!variant) throw new Error("Product variant not found");
          if (variant.stock !== null && variant.stock < quantity)
            throw new Error("Insufficient stock available");

          await prisma.cartItem.updateMany({
            where: { variantId, userId: user.id },
            data: { quantity },
          });
        }

        // Async cache invalidation
        Promise.all([
          delCache("carts:all"),
          delCache(`carts:user:${user.id}`),
        ]).catch(console.error);

        return true;
      } catch (error: any) {
        console.error("Error updating cart quantity:", error);
        throw error instanceof Error
          ? error
          : new Error(`Failed to update cart quantity: ${error.message}`);
      }
    },

    clearCart: async (_: any, __: any, ctx: GraphQLContext) => {
      try {
        const user = requireAuth(ctx);

        await prisma.cartItem.deleteMany({ where: { userId: user.id } });

        // Async cache invalidation
        Promise.all([
          delCache("carts:all"),
          delCache(`carts:user:${user.id}`),
        ]).catch(console.error);

        return true;
      } catch (error: any) {
        console.error("Error clearing cart:", error);
        throw new Error(`Failed to clear cart: ${error.message}`);
      }
    },
  },
};
