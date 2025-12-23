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
    "/sign-in",
    "/sign-up",
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
    "/account", // Account pages are now public (will show guest user)
    "/checkout", // Checkout is public
    "/payment", // Payment status pages
];

export default function AuthGate({ children }: AuthGateProps) {
    const { data: session, isPending } = useSession();
    const pathname = usePathname();


    if (isPending) {
        console.log("AuthGate: Session pending...");
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse font-medium">Loading Vanijay...</p>
                </div>
            </div>
        );
    }

    const isPublicRoute = PUBLIC_ROUTES.some(route => {
        if (route === "/") return pathname === "/";
        return pathname.startsWith(route);
    });

    // Check if user is fully verified
    const isPhoneVerified = (session?.user as any)?.phoneVerified;

    // If session exists, they MUST be verified even for public routes (except auth routes)
    if (session) {
        if (!isPhoneVerified) {
            // Allow them to see /sign-in, /sign-up, /verify-phone without AuthGate interference
            const isAuthRoute = ["/sign-in", "/sign-up", "/verify-phone"].some(route => pathname.startsWith(route));

            if (isAuthRoute) {
                return <>{children}</>;
            }

            console.log("AuthGate: Authenticated but not verified. Enforcing verification UI.");
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
