import { ChatLayout } from "@/components/page/chat/ChatLayout";
import { GET_USER_PROFILE_DETAILS } from "@/client/user/user.queries";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";

export default async function ChatPage() {
    const client = await getServerApolloClient();
    const { data } = await client.query({
        query: GET_USER_PROFILE_DETAILS,
        fetchPolicy: "no-cache",
    });

    return (
        <div className="h-full">
            <ChatLayout userId={data?.getUserProfileDetails?.id} />
        </div>
    );
}
