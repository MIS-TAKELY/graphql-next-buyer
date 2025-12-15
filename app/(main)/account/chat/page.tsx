export const dynamic = "force-dynamic";

import SidebarNav from "@/components/page/account/SidebarNav";
import { ChatLayout } from "@/components/page/chat/ChatLayout";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { GET_USER_PROFILE_DETAILS } from "@/client/user/user.queries";

export default async function ChatPage() {
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
        return <div>Please log in to view messages.</div>;
    }

    return (
        <div className="min-h-screen bg-muted/20">
            <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto px-4 py-8">
                <SidebarNav
                    user={user}
                    activeTab="chat"
                />
                <div className="flex-1 min-w-0 w-full">
                    <ChatLayout userId={user.id} />
                </div>
            </div>
        </div>
    );
}
