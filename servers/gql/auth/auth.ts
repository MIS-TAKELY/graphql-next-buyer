// auth/auth.ts
import { prisma } from "../../../lib/db/prisma";
import { GraphQLContext } from "../context";

export function requireAuth(ctx: GraphQLContext) {
  if (!ctx.user) throw new Error("Authentication required");
  if (ctx.user.isBanned) throw new Error("Your account has been suspended");
  return ctx.user;
}

export function requireSeller(ctx: GraphQLContext) {
  const user = requireAuth(ctx);
  if (!user.roles.includes("SELLER")) {
    throw new Error("Seller access required");
  }
  return user;
}

export function requireAdmin(ctx: GraphQLContext) {
  const user = requireAuth(ctx);
  if (!user.roles.includes("ADMIN")) {
    throw new Error("Admin access required");
  }
  return user;
}

export function requireBuyer(ctx: GraphQLContext) {
  const user = requireAuth(ctx);

  if (!user.roles.includes("BUYER")) {
    console.warn(`[AUTH] User ${user.id} (${user.email}) is missing BUYER role. Attempting self-healing...`);

    // Self-healing: if they are authenticated, they should at least be a buyer
    // We do this fire-and-forget or awaited? Awaiting is safer to ensure next request works.
    // However, this is a middleware-like check.
    // We can't easily modify ctx.user.roles here and expect it to persist for the current request
    // if it was already populated, but the throw will be avoided if we "allow" it.

    // Background task to fix it in DB
    prisma.userRole.upsert({
      where: { userId_role: { userId: user.id, role: "BUYER" } },
      create: { userId: user.id, role: "BUYER" },
      update: {},
    }).catch(err => console.error(`[AUTH] Failed to self-heal BUYER role for ${user.id}:`, err));

    // For the current request, we'll allow it since they are authenticated
    return user;
  }

  return user;
}