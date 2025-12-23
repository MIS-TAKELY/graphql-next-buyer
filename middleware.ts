import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = [
  "/sign-in",
  "/sign-up",
  "/api/auth",
  "/api/otp",
  "/api/webhook",
  "/api/products",
  "/api/graphql",
  "/cart",
  "/",
  "/search",
  "/category",
  "/product",
  "/store",
  "/compare",
];

export default async function middleware(request: NextRequest) {
  const { nextUrl } = request;

  // 0. Early return for public routes - DO NOT check session
  const isPublicRoute = publicRoutes.some(route =>
    nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`)
  );

  if (isPublicRoute || nextUrl.pathname === "/verify-phone") {
    return NextResponse.next();
  }

  // 1. Check session via fetch (edge-compatible)
  // Note: We use fetch instead of auth.api.getSession to avoid importing Prisma in the Edge runtime
  const sessionResponse = await fetch(`${nextUrl.origin}/api/auth/get-session`, {
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  const session = await sessionResponse.json();

  // 2. If not logged in and trying to access a protected route
  if (!session || !session.user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // 3. If logged in but phone is not verified
  if (session.user && !session.user.phoneVerified) {
    // middleware matcher already excludes static assets, so we just check for non-public routes
    return NextResponse.redirect(new URL("/verify-phone", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
