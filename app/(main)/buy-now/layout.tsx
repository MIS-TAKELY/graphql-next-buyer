import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { GET_USER_PROFILE_DETAILS } from "@/client/user/user.queries";
import { redirect } from "next/navigation";

export default async function BuyNowLayout({
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

    // Redirect to sign-in if user is not authenticated
    if (!user) {
        redirect("/");
    }

    return <>{children}</>;
}
