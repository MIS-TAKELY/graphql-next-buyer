import { GET_TOP_DEALS } from "@/client/landing/topdeals.query";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import LandingPageProductGrid from "./LandingPageProductGrid";

export const LandingPageProductGridWrapper = async ({
  title,
  isLast = false,
  topDealAbout
}: {
  title: string;
  isLast?: boolean;
  topDealAbout:string
}) => {
  const client = await getServerApolloClient();

  let data;
  let error;

  try {
    const response = await client.query({
      query: GET_TOP_DEALS,
      variables: {
        topDealAbout,
        limit: 4,
      },
      fetchPolicy: "cache-first",
    });
    data = response.data;
  } catch (err) {
    console.error("Error fetching top deals:", err);
    error = err;
  }

  return (
    <LandingPageProductGrid
      title={title}
      data={data}
      error={error}
      // Force horizontal layout for the last item when it's alone in a row on md screens
      forceHorizontal={isLast}
    />
  );
};
