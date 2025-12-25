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

  // 0. Early return for auth API routes, OTP routes, and verify-phone
  if (
    nextUrl.pathname.startsWith("/api/auth") ||
    nextUrl.pathname.startsWith("/api/otp") ||
    nextUrl.pathname === "/verify-phone"
  ) {
    return NextResponse.next();
  }

  // Enforce canonical domain (www.vanijay.com)
  if (process.env.NODE_ENV === "production" && nextUrl.hostname === "vanijay.com") {
    return NextResponse.redirect(new URL(`https://www.vanijay.com${nextUrl.pathname}${nextUrl.search}`));
  }

  // 1. Check session existence via cookie (optimistic check)
  // We check for both standard and secure cookies to support dev and prod
  const sessionToken = request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  const isLoggedIn = !!sessionToken;

  const isPublicRoute = publicRoutes.some(route =>
    nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`)
  );

  // 2. If not logged in
  if (!isLoggedIn) {
    if (isPublicRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // 2.5 If logged in, don't allow access to sign-in/sign-up
  // if (nextUrl.pathname.startsWith("/sign-in") || nextUrl.pathname.startsWith("/sign-up")) {
  //   return NextResponse.redirect(new URL("/", request.url));
  // }

  // Note: Phone verification check is handled in AuthGate (client-side) 
  // to avoid expensive and fragile database/API calls in Edge Middleware.

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
