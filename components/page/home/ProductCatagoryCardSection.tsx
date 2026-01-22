"use client";

import { categories as defaultCategories } from "@/data/catagory";
import Link from "next/link";
import { memo } from "react";
import * as Icons from "lucide-react";

type Props = {
  categories?: any[];
};

const ProductCategoryCardSection = memo(({ categories = defaultCategories }: Props) => {
  console.log("categories-->", categories)
  return (
    <section className="bg transition-colors duration-300 w-full py-2">
      <div className="bg-card container-custom">
        {/* Scrollable container for mobile, grid for lg+ */}
        <div className="overflow-x-auto lg:overflow-x-visible scrollbar-hide lg:scrollbar-auto snap-x snap-mandatory">
          <div
            className="
                flex lg:grid lg:grid-cols-[repeat(auto-fit,minmax(80px,1fr))]
                
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
                        w-20 xs:w-24 sm:w-28 md:w-24 lg:w-full py-2
                      "
                    aria-label={`Go to ${category.categoryName || category.name} category`}
                  >
                    <div
                      className={`
                          w-16 xs:w-16 sm:w-18 md:w-20 lg:w-22 xl:w-24
                          h-16 xs:h-16 sm:h-18 md:h-20 lg:h-22 xl:h-24
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
                          className="w-full h-full object-cover"
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
                          text-[12px] xs:text-md sm:text-md md:text-md lg:text-sm xl:text-base
                          font-medium text-foreground text-center
                          line-clamp-1
                          max-w-[60px] xs:max-w-[80px] sm:max-w-[100px] md:max-w-[80px] lg:max-w-full
                          px-0.5
                        "
                    >
                      {category.categoryName || category.name}
                    </h3>

                  </button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
});

ProductCategoryCardSection.displayName = "ProductCategoryCardSection";

export default ProductCategoryCardSection;