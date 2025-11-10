import { GET_TOP_DEALS } from "@/client/landing/topdeals.query";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import LandingPagrCategorySwiper from "./LandingPagrCategorySwiper";
import { LandingPagrCategorySwiperData, TopDeal } from "./types";

interface Props {
  title: string;
  category: string;
}

const LandingPagrCategorySwiperWrapper = async ({ title, category }: Props) => {
  const client = await getServerApolloClient();

  let data: LandingPagrCategorySwiperData | undefined;
  let error: any;

  try {
    const response = await client.query<{ getTopDealsaveUpTo: TopDeal[] }>({
      query: GET_TOP_DEALS,
      variables: { topDealAbout: category, limit: 10 },
      fetchPolicy: "cache-first",
    });
    data = response.data;
    console.log("LandingPagrCategorySwiper data:", data);
  } catch (err) {
    console.error("Error fetching top deals:", err);
    error = err;
  }

  return (
    <LandingPagrCategorySwiper
      data={data || { getTopDealsaveUpTo: [] }}
      title={title}
    />
  );
};

export default LandingPagrCategorySwiperWrapper;
