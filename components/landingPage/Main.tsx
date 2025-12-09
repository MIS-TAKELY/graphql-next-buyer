import { LandingPageProductGridWrapper } from "./LandingPageProductGridWrapper";
import LandingPagrCategorySwiperWrapper from "./LandingPagrCategorySwiperWrapper";

export const revalidate = 5;

const Main = async () => {
  return (
    <main className="bg-background pt-2 sm:pt-4 pb-4 sm:pb-8">
      <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-12">
        {/* Category Sections */}
        <LandingPagrCategorySwiperWrapper
          title="Best Deals on Electronics"
          category="Electronics"
        />

        <LandingPagrCategorySwiperWrapper
          title="Best Deals on Furniture"
          category="Furniture"
        />

        <LandingPagrCategorySwiperWrapper
          title="Best Deals on Fashion"
          category="Fashion"
        />

        {/* Product Grid Section */}
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Featured Products */}
            <LandingPageProductGridWrapper
              title="Featured Products"
              topDealAbout="kitchen"
            />

            {/* Best Deals */}
            <LandingPageProductGridWrapper
              title="Best Deals"
              topDealAbout="books"
            />

            {/* Top Rated */}
            <LandingPageProductGridWrapper
              title="Top Rated"
              topDealAbout="medicine"
            />
          </div>
        </div>

        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Featured Products */}
            <LandingPageProductGridWrapper
              title="Featured Products"
              topDealAbout="kitchen"
            />

            {/* Top Rated */}
            <LandingPageProductGridWrapper
              title="Top Rated"
              topDealAbout="medicine"
            />

            {/* Best Deals */}
            <LandingPageProductGridWrapper
              title="Best Deals"
              topDealAbout="books"
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Main;