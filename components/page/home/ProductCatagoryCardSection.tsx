"use client";

import { categories as defaultCategories } from "@/data/catagory";
import Link from "next/link";
import { memo } from "react";
import * as Icons from "lucide-react";

type Props = {
  categories?: any[];
};

const ProductCategoryCardSection = memo(({ categories = defaultCategories }: Props) => {
  return (
    <section className="bg transition-colors duration-300 w-full py-2">
      <div className="container-custom">
        <div className="bg-card w-full">
          {/* Scrollable container for mobile, grid for lg+ */}
          <div className="overflow-x-auto lg:overflow-x-visible scrollbar-hide lg:scrollbar-auto snap-x snap-mandatory">
            <div
              className="
                flex lg:grid lg:grid-cols-[repeat(auto-fit,minmax(80px,1fr))]
                gap-2 xs:gap-3 sm:gap-4 md:gap-3 lg:gap-2 xl:gap-3 2xl:gap-4
                pb-2 xs:pb-2 sm:pb-3 md:pb-4
                px-2 xs:px-3 sm:px-4 md:px-0
                min-w-max lg:min-w-0
              "
            >
              {categories.map((category: any, index: number) => {
                return (
                  <Link key={category.id || index} href={`/search?q=${category.categoryName || category.name}`}>
                    <button
                      className="
                        flex flex-col items-center justify-center
                        group focus:outline-none
                        transition-transform hover:scale-105 active:scale-95
                        flex-shrink-0 lg:flex-shrink
                        w-20 xs:w-24 sm:w-28 md:w-24 lg:w-full
                      "
                      aria-label={`Go to ${category.categoryName || category.name} category`}
                    >
                      <div
                        className={`
                          w-12 xs:w-14 sm:w-16 md:w-14 lg:w-16 xl:w-18
                          h-12 xs:h-14 sm:h-16 md:h-14 lg:h-16 xl:h-18
                          bg-gradient-to-br ${category.color}
                          flex items-center justify-center
                          shadow-sm group-hover:shadow-lg
                          transition-all duration-200
                          overflow-hidden
                          ${!category.image ? 'rounded-none' : ''} 
                        `}
                      // Note: Added overflow-hidden to clip image if needed, though they are usually icons.
                      // Removed dynamic icon logic.
                      >
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.categoryName}
                            className="w-full h-full object-cover p-2"
                          />
                        ) : (
                          <Icons.LayoutGrid
                            className="
                              text-white
                              w-5 xs:w-6 sm:w-7 md:w-6 lg:w-7 xl:w-8
                              h-5 xs:h-6 sm:h-7 md:h-6 lg:h-7 xl:h-8
                            "
                          />
                        )}
                      </div>
                      <h3
                        className="
                          mt-1 xs:mt-1.5 sm:mt-2 md:mt-1.5 lg:mt-2
                          text-[10px] xs:text-xs sm:text-sm md:text-xs lg:text-sm xl:text-base
                          font-medium text-foreground text-center
                          line-clamp-1 lg:line-clamp-2
                          max-w-[60px] xs:max-w-[80px] sm:max-w-[100px] md:max-w-[80px] lg:max-w-full
                          px-0.5
                        "
                      >
                        {category.categoryName || category.name}
                      </h3>
                      {category.count && (
                        <p
                          className="
                            text-[8px] xs:text-[9px] sm:text-[10px] md:text-[9px] lg:text-[10px] xl:text-xs
                            text-muted-foreground text-center
                          "
                        >
                          {category.count}
                        </p>
                      )}
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

ProductCategoryCardSection.displayName = "ProductCategoryCardSection";

export default ProductCategoryCardSection;