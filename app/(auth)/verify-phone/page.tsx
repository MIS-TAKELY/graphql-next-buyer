import UnifiedAuth from "@/components/auth/UnifiedAuth";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function VerifyPhonePage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/");
    }

    if (session.user.phoneNumberVerified) {
        redirect("/");
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <UnifiedAuth />
        </div>
    );
}
