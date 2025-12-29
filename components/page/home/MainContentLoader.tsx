import { GET_LANDING_PAGE_CATEGORY_CARDS, GET_LANDING_PAGE_CATEGORY_SWIPERS, GET_LANDING_PAGE_PRODUCT_GRIDS } from "@/client/landing/landing-page-config.queries";
import Main from "@/components/landingPage/Main";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";

export default async function MainContentLoader() {
    const client = await getServerApolloClient();

    const [swipersData, gridsData] = await Promise.all([
        client.query({ query: GET_LANDING_PAGE_CATEGORY_SWIPERS }),
        client.query({ query: GET_LANDING_PAGE_PRODUCT_GRIDS }),
    ]);

    const swipers = swipersData.data?.getLandingPageCategorySwipers || [];
    const grids = gridsData.data?.getLandingPageProductGrids || [];

    return <Main swipers={swipers} grids={grids} />;
}
