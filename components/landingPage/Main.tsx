import React from "react";
import { LandingPageProductGridWrapper } from "./LandingPageProductGridWrapper";
import LandingPagrCategorySwiperWrapper from "./LandingPagrCategorySwiperWrapper";

export const revalidate = 5;

type MainProps = {
  swipers: any[];
  grids: any[];
};

const Main = ({ swipers, grids }: MainProps) => {
  // Group swipers first, then grids (each sorted by their own sortOrder)
  const sortedSwipers = swipers
    .map((s: any) => ({
      ...s,
      type: 'swiper',
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const sortedGrids = grids
    .map((g: any) => ({
      ...g,
      type: 'grid',
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const sections: any[] = [...sortedSwipers, ...sortedGrids];

  // Fallback to defaults if no config found (optional, or just show empty)
  // Logic: if Admin returns empty arrays, it means either no content or error.
  // For now, if empty, we might want to keep existing hardcoded ones as fallback or show nothing.
  // The user requested to "send list... from admin". So we should rely on admin.
  // However, during dev/first run, it might be empty. Let's assume admin has data or we show nothing.

  // Group grids into chunks of 3 for display
  const renderSections = () => {
    const result: React.ReactElement[] = [];
    let gridBuffer: any[] = [];

    sections.forEach((section, index) => {
      if (section.type === 'swiper') {
        // If we have buffered grids, render them first
        if (gridBuffer.length > 0) {
          result.push(
            <div key={`grid-group-${gridBuffer[0].id}`} className="container-custom bg-card py-2 sm:py-4 md:py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {gridBuffer.map((grid, idx) => (
                  <LandingPageProductGridWrapper
                    key={grid.id}
                    title={grid.title}
                    topDealAbout={grid.topDealAbout}
                    productIds={grid.productIds}
                    isLast={idx === gridBuffer.length - 1 && gridBuffer.length % 3 !== 0}
                  />
                ))}
              </div>
            </div>
          );
          gridBuffer = [];
        }

        // Render the swiper
        result.push(
          <LandingPagrCategorySwiperWrapper
            key={section.id}
            title={section.title}
            category={section.category}
          />
        );
      } else {
        // Add grid to buffer
        gridBuffer.push(section);

        // If buffer has 3 items or this is the last section, render the buffered grids
        if (gridBuffer.length === 3 || index === sections.length - 1) {
          result.push(
            <div key={`grid-group-${gridBuffer[0].id}`} className="container-custom bg-card py-2 sm:py-4 md:py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {gridBuffer.map((grid, idx) => (
                  <LandingPageProductGridWrapper
                    key={grid.id}
                    title={grid.title}
                    topDealAbout={grid.topDealAbout}
                    productIds={grid.productIds}
                    isLast={idx === gridBuffer.length - 1 && gridBuffer.length % 3 !== 0}
                  />
                ))}
              </div>
            </div>
          );
          gridBuffer = [];
        }
      }
    });

    return result;
  };

  return (
    <main className="bg-background pt-2 sm:pt-4 pb-4 sm:pb-8">
      <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-12">
        {renderSections()}

        {/* 
          Note: The original 'grid' had multiple `LandingPageProductGridWrapper` side-by-side in one row.
          The new model treats each 'LandingPageProductGrid' as a section.
          If we want to group them into one row (grid-cols-3), we need a 'Row' generic container or 
          the admin needs to define 'rows' that contain 'grids'.
          
          Based on schema, 'LandingPageProductGrid' is a top-level section.
          If the user wants 3 grids in one row, they would likely need a "GridRow" type or 
          we layout them differently.
          
          Current implementation: Each ProductGridSection will take full width (or custom container).
          The original code had:
          <div className="container-custom ...">
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <Wrapper /> <Wrapper /> <Wrapper />
             </div>
          </div>
          
          If the admin creates 3 grids, they will appear stacked vertically unless we group them.
          To keep it simple: Render each as a full section. 
          OR: We can implement logic to group adjacent 'grid' type sections into one container?
          
          Let's try to replicate original look:
          If we detect consecutive 'grid' sections, we can group them. 
          But for simplicity/predictability, let's just render them. 
          If they are meant to be side-by-side, we would need a layout builder.
          
          Re-reading user request: "data of Main component... which includes... products list (optional)"
          and "Ui along with ui that can send list of category that would show in ProductCatagoryCardSection".
          
          Given the schema 'LandingPageProductGrid', it seems independent.
          However, to maintain the layout of "Featured / Best Deals / Top Rated" side-by-side, 
          we effectively need a "GridGroup". 
          
          For now, I'll render them individually. If the user wants the side-by-side layout, 
          they might need a more complex schema or I just stack them. 
          Stacking is safer for mobile-first. 
        */}
      </div>
    </main>
  );
};

export default Main;