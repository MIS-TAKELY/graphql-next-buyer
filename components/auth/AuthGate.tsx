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

    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

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

    // If the user is on a public route (like sign-in page itself), let them see it
    if (isPublicRoute) {
        return <>{children}</>;
    }

    // Check if user is fully verified
    const isEmailVerified = session?.user?.emailVerified;
    const isPhoneVerified = (session?.user as any)?.phoneVerified;

    if (!session || !isEmailVerified || !isPhoneVerified) {
        console.log("AuthGate: Access denied/incomplete profile", {
            hasSession: !!session,
            isEmailVerified,
            isPhoneVerified,
            pathname
        });
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

    console.log("AuthGate: Rendering children for", pathname);
    return <>{children}</>;
}
