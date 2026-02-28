import { GET_TOP_DEALS } from "@/client/landing/topdeals.query";
import { GET_PRODUCTS_BY_IDS } from "@/client/product/product.queries";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import LandingPageProductGrid from "./LandingPageProductGrid";
import { CacheService } from "@/services/CacheService";

export const LandingPageProductGridWrapper = async ({
  title,
  isLast = false,
  topDealAbout,
  productIds
}: {
  title: string;
  isLast?: boolean;
  topDealAbout: string;
  productIds?: string[];
}) => {
  const client = await getServerApolloClient();

  let data;
  let error;

  try {
    // If productIds explicitly provided, fetch those products
    if (productIds && productIds.length > 0) {
      const response = await client.query({
        query: GET_PRODUCTS_BY_IDS,
        variables: { ids: productIds },
        fetchPolicy: "no-cache",
      });

      const products = response.data?.getProductsByIds || [];

      // Map products to the shape expected by LandingPageProductGrid
      const deals = products.map((p: any) => {
        const variant = p.variants?.[0] || {};
        const mrp = variant.mrp || 0;
        const price = variant.price || 0;
        const saveUpTo = mrp > price ? mrp - price : 0;

        return {
          name: p.name,
          imageUrl: p.images?.[0]?.url,
          imageAltText: p.images?.[0]?.altText || p.name,
          saveUpTo,
          product: p
        };
      });

      data = { getTopDealSaveUpTo: deals };

    } else {
      // Fallback to top deals logic
      const CACHE_KEY = CacheService.generateKey("top-deals-v2", `${topDealAbout}-limit-4`);
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
    }

  } catch (err) {
    console.error("Error fetching grid data:", err);
    error = err;
  }

  return (
    <LandingPageProductGrid
      title={title}
      data={JSON.parse(JSON.stringify(data || null))}
      error={JSON.parse(JSON.stringify(error || null))}
      // Force horizontal layout for the last item when it's alone in a row on md screens
      forceHorizontal={isLast}
      categorySlug={topDealAbout}
    />
  );
};