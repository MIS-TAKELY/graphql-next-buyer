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

  try {
    const response = await client.query<{ getTopDealSaveUpTo: TopDeal[] }>({
      query: GET_TOP_DEALS,
      variables: { topDealAbout: category, limit: 10 },
      fetchPolicy: "cache-first",
    });
    data = response.data;
  } catch (err) {
    console.error("Error fetching top deals:", err);
  }

  return (
    <LandingPagrCategorySwiper
      data={data || { getTopDealSaveUpTo: [] }}
      title={title}
    />
  );
};

export default LandingPagrCategorySwiperWrapper;