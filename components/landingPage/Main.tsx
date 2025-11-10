  import { LandingPageProductGridWrapper } from "./LandingPageProductGridWrapper";
  import LandingPagrCategorySwiperWrapper from "./LandingPagrCategorySwiperWrapper";

  export const revalidate = 5;

  const Main = async () => {
    return (
      <main className="bg-background pt-0 sm:pt-4 pb-4 sm:pb-8">
        <div className="space-y-2 xs:space-y-4 sm:space-y-8 md:space-y-12">
          {/* Category Sections */}
          <div className="mobile-full sm:container">
            <LandingPagrCategorySwiperWrapper
              title="Best Deals on Electronics"
              category="Electronics"
            />
          </div>

          <div className="mobile-full sm:container">
            <LandingPagrCategorySwiperWrapper
              title="Best Deals on Furniture"
              category="Furniture"
            />
          </div>

          <div className="mobile-full sm:container">
            <LandingPagrCategorySwiperWrapper
              title="Best Deals on Fashion"
              category="Fashion"
            />
          </div>

          {/* Product Grid Section with Responsive Layout */}
          <div className="container px-2 sm:px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Featured Products */}
              <div className="w-full">
                <LandingPageProductGridWrapper title="Featured Products" />
              </div>

              {/* Best Deals */}
              {/* <div className="w-full">
                <LandingPageProductGridWrapper
                  title="Best Deals"
                />
              </div> */}

              {/* Top Rated - This will be alone in the bottom row on md screens */}
              {/* <div className="w-full md:col-span-2 xl:col-span-1">
                <LandingPageProductGridWrapper
                  title="Top Rated"
                  // isLast={true}
                />
              </div> */}
            </div>
          </div>
        </div>
      </main>
    );
  };

  // Wrapper component to handle responsive behavior

  export default Main;
