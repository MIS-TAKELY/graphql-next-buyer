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

  // Enforce canonical domain (www.vanijay.com)
  if (process.env.NODE_ENV === "production" && nextUrl.hostname === "vanijay.com") {
    return NextResponse.redirect(new URL(`https://www.vanijay.com${nextUrl.pathname}${nextUrl.search}`));
  }

  // 0. Early return for auth API routes and verify-phone
  if (nextUrl.pathname.startsWith("/api/auth") || nextUrl.pathname === "/verify-phone") {
    return NextResponse.next();
  }

  // 1. Check session via fetch (edge-compatible)
  const sessionResponse = await fetch(`${nextUrl.origin}/api/auth/get-session`, {
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  let session = null;
  try {
    session = await sessionResponse.json();
  } catch (e) {
    // Session fetch failed or returned invalid JSON
  }

  const isPublicRoute = publicRoutes.some(route =>
    nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`)
  );

  // 2. If not logged in
  if (!session || !session.user) {
    if (isPublicRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // 3. If logged in but phone is not verified
  if (session.user && !session.user.phoneVerified) {
    if (nextUrl.pathname !== "/verify-phone") {
      return NextResponse.redirect(new URL("/verify-phone", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
