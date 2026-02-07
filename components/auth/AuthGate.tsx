"use client";

import { useSession } from "@/lib/auth-client";
import UnifiedAuth from "./UnifiedAuth";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AuthGateProps {
    children: React.ReactNode;
}

// Routes that don't require full verification
const PUBLIC_ROUTES = [
    "/verify-phone",
    "/", // Landing page
    "/compare",
    "/cart",
    "/search",
    "/product",
    "/category",
    "/store",
    "/about",
    "/contact",
    "/blog",
    "/careers",
    "/account", // Account pages are now public (will show guest user)
    "/checkout", // Checkout is public
    "/payment", // Payment status pages
    "/reset-password",
    "/privacy-policy",
    "/cookie-policy",
    "/terms-conditions",
    "/returns-policy",
    "/shipping-policy",
    "/site-map",
    "/help",
];


export default function AuthGate({ children }: AuthGateProps) {
    const { data: session, isPending } = useSession();
    const pathname = usePathname();



    const isPublicRoute = PUBLIC_ROUTES.some(route => {
        if (route === "/") return pathname === "/";
        return pathname.startsWith(route);
    }) || pathname.startsWith("/best-");

    // Check if user is fully verified
    const isPhoneVerified = (session?.user as any)?.phoneVerified;

    // If session exists, they MUST be verified even for public routes (except auth routes)
    if (session) {
        if (!isPhoneVerified) {
            // Allow them to see /verify-phone and ALL public routes without AuthGate interference
            const isAuthRoute = ["/verify-phone"].some(route => pathname.startsWith(route));

            if (isAuthRoute || isPublicRoute) {
                return <>{children}</>;
            }

            console.log("AuthGate: Authenticated but not verified for private route. Enforcing verification UI.");
            return (
                <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-secondary/10 to-primary/5 p-4">
                    <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl opacity-50" />
                    <div className="relative z-10 w-full animate-fade-in">
                        <UnifiedAuth />
                    </div>
                </div>
            );
        }
    }

    // If not logged in, allow public routes
    if (!session && isPublicRoute) {
        return <>{children}</>;
    }

    // If not logged in and private route
    if (!session) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-secondary/10 to-primary/5 p-4">
                <div className="relative z-10 w-full animate-fade-in">
                    <UnifiedAuth />
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
