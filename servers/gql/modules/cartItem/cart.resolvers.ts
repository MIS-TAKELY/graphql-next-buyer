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

        // 1. Try cache
        const cached = await getCache(cacheKey);
        if (cached) {
          console.log("⚡ Returning carts from Redis");
          return cached;
        }

        // 2. DB fetch
        const carts = await prisma.cartItem.findMany({
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
            variant: {
              include: {
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

        // 3. Cache result
        await setCache(cacheKey, carts, 60); // TTL 1 min
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

        // 1. Try cache
        const cached = await getCache(cacheKey);
        if (cached) {
          console.log("⚡ Returning myCart from Redis");
          return cached;
        }

        // 2. DB fetch
        const myCart = await prisma.cartItem.findMany({
          where: { userId: user.id },
          include: {
            user: { select: { id: true, firstName: true } },
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    images: { select: { url: true, altText: true }, take: 1 },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        // 3. Cache result
        await setCache(cacheKey, myCart, 60);
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

        // Check if variant exists
        const variant = await prisma.productVariant.findUnique({
          where: { id: variantId },
          include: {
            product: { select: { id: true, name: true, status: true } },
          },
        });

        if (!variant) throw new Error("Product variant not found");
        if (variant.stock !== null && variant.stock < quantity)
          throw new Error("Insufficient stock available");
        if (variant.product.status !== "ACTIVE")
          throw new Error("Product is not available");

        // Upsert
        await prisma.cartItem.upsert({
          where: { userId_variantId: { userId: user.id, variantId } },
          update: { quantity: { increment: quantity } },
          create: { userId: user.id, variantId, quantity },
        });

        // Invalidate caches
        await delCache("carts:all");
        await delCache(`carts:user:${user.id}`);

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

        const cartItem = await prisma.cartItem.findFirst({
          where: { variantId, userId: user.id },
        });
        if (!cartItem) throw new Error("Item not found in cart");

        await prisma.cartItem.delete({ where: { id: cartItem.id } });

        // Invalidate caches
        await delCache("carts:all");
        await delCache(`carts:user:${user.id}`);

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
          const cartItem = await prisma.cartItem.findFirst({
            where: { variantId, userId: user.id },
          });
          if (cartItem) {
            await prisma.cartItem.delete({ where: { id: cartItem.id } });
          }
        } else {
          const variant = await prisma.productVariant.findUnique({
            where: { id: variantId },
          });
          if (!variant) throw new Error("Product variant not found");
          if (variant.stock !== null && variant.stock < quantity)
            throw new Error("Insufficient stock available");

          await prisma.cartItem.updateMany({
            where: { variantId, userId: user.id },
            data: { quantity },
          });
        }

        // Invalidate caches
        await delCache("carts:all");
        await delCache(`carts:user:${user.id}`);

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

        // Invalidate caches
        await delCache("carts:all");
        await delCache(`carts:user:${user.id}`);

        return true;
      } catch (error: any) {
        console.error("Error clearing cart:", error);
        throw new Error(`Failed to clear cart: ${error.message}`);
      }
    },
  },
};
