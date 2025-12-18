export const dynamic = "force-dynamic";

import AccountClient from "@/components/page/account/AccountClient";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { GET_USER_PROFILE_DETAILS } from "@/client/user/user.queries";
import { redirect } from "next/navigation";

export default async function AccountPage() {
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
    <div className="min-h-screen bg-muted/20">
      <AccountClient user={user} />
    </div>
  );
}