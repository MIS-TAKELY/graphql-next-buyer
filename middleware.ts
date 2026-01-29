import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = [
  "/api/auth",
  "/api/otp",
  "/api/products",
  "/api/graphql",
  "/cart",
  "/",
  "/search",
  "/category",
  "/product",
  "/store",
  "/compare",
  "/terms-conditions",
  "/cookie-policy",
  "/shipping-policy",
  "/returns-policy",
  "/privacy-policy",
  "/reset-password",
  "/about",
  "/contact",
  "/careers",
  "/site-map",
  "/help",
  "/blog",
  "/robots.txt",
  "/sitemap.xml",
];

export default async function middleware(request: NextRequest) {
  const { nextUrl } = request;

  // No restriction for sitemap.xml (make it public for easier crawler access and search console verification)
  // if (nextUrl.pathname === "/sitemap.xml") {
  //   const userAgent = request.headers.get("user-agent") || "";
  //   const botPatterns = [
  //     "googlebot",
  //     "bingbot",
  //     "yandexbot",
  //     "duckduckbot",
  //     "slurp",
  //     "baiduspider",
  //     "facebookexternalhit",
  //     "twitterbot",
  //     "linkedinbot",
  //     "pinterest",
  //     "slackbot",
  //   ];
  //   const isBot = botPatterns.some((bot) => userAgent.toLowerCase().includes(bot));

  //   if (!isBot) {
  //     // Return 404 to regular users so it looks like the file doesn't exist
  //     return new NextResponse(null, { status: 404 });
  //   }
  // }

  // 0. Early return for auth API routes, OTP routes, and verify-phone
  if (
    nextUrl.pathname.startsWith("/api/auth") ||
    nextUrl.pathname.startsWith("/api/otp") ||
    nextUrl.pathname === "/verify-phone"
  ) {
    return NextResponse.next();
  }

  // Enforce canonical domain (www.vanijay.com) with 301 Permanent Redirect
  if (process.env.NODE_ENV === "production" && nextUrl.hostname === "vanijay.com") {
    const canonicalUrl = new URL(`https://www.vanijay.com${nextUrl.pathname}${nextUrl.search}`);
    return NextResponse.redirect(canonicalUrl, { status: 301 });
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
    return NextResponse.redirect(new URL("/", request.url));
  }

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
