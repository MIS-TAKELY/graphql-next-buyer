export const dynamic = "force-dynamic";

import SidebarNav from "@/components/page/account/SidebarNav";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { GET_USER_PROFILE_DETAILS } from "@/client/user/user.queries";
import { redirect } from "next/navigation";

export default async function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const client = await getServerApolloClient();
    let user = null;

    try {
        const { data } = await client.query({
            query: GET_USER_PROFILE_DETAILS,
            fetchPolicy: "no-cache",
        });
        user = data?.getUserProfileDetails;
    } catch (error) {
        console.error("Failed to fetch user profile:", error);
    }

    if (!user) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-muted/20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-8">
                    <h1 className="text-3xl font-bold mb-8">My Account</h1>
                    <div className="flex flex-col lg:flex-row gap-8">
                        <SidebarNav user={user} />
                        <main className="flex-1 min-w-0">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}
