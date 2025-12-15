import { GET_TOP_DEALS } from "@/client/landing/topdeals.query";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import LandingPagrCategorySwiper from "./LandingPagrCategorySwiper";
import { LandingPagrCategorySwiperData, TopDeal } from "./types";
import { CacheService } from "@/services/CacheService";

interface Props {
  title: string;
  category: string;
}

const LandingPagrCategorySwiperWrapper = async ({ title, category }: Props) => {
  const client = await getServerApolloClient();
  let data: LandingPagrCategorySwiperData | undefined;

  try {
    const CACHE_KEY = CacheService.generateKey("category-swiper", category);
    const cachedData = await CacheService.get<LandingPagrCategorySwiperData>(CACHE_KEY);

    if (cachedData) {
      data = cachedData;
    } else {
      const response = await client.query<{ getTopDealSaveUpTo: TopDeal[] }>({
        query: GET_TOP_DEALS,
        variables: { topDealAbout: category, limit: 10 },
        fetchPolicy: "no-cache",
      });
      data = response.data;

      if (data) {
        await CacheService.set(CACHE_KEY, data, 3600);
      }
    }
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