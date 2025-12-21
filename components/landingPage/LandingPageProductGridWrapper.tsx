import { GET_TOP_DEALS } from "@/client/landing/topdeals.query";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import LandingPageProductGrid from "./LandingPageProductGrid";
import { CacheService } from "@/services/CacheService";

export const LandingPageProductGridWrapper = async ({
  title,
  isLast = false,
  topDealAbout
}: {
  title: string;
  isLast?: boolean;
  topDealAbout: string
}) => {
  const client = await getServerApolloClient();

  let data;
  let error;

  try {
    const CACHE_KEY = CacheService.generateKey("top-deals", `${topDealAbout}-limit-4`);
    // Need to type the cache response correctly or cast it
    const cachedData = await CacheService.get<any>(CACHE_KEY);

    if (cachedData) {
      data = cachedData;
    } else {
      const response = await client.query({
        query: GET_TOP_DEALS,
        variables: {
          topDealAbout,
          limit: 4,
        },
        fetchPolicy: "no-cache",
      });
      data = response.data;

      if (data) {
        await CacheService.set(CACHE_KEY, data, 3600);
      }
    }

    console.log("data-->", data)
  } catch (err) {
    console.error("Error fetching top deals:", err);
    error = err;
  }

  return (
    <LandingPageProductGrid
      title={title}
      data={JSON.parse(JSON.stringify(data || null))}
      error={JSON.parse(JSON.stringify(error || null))}
      // Force horizontal layout for the last item when it's alone in a row on md screens
      forceHorizontal={isLast}
    />
  );
};