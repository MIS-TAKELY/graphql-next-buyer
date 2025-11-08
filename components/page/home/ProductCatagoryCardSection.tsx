"use client";

import { categories } from "@/data/catagory";
import Link from "next/link";
import { memo } from "react";

const ProductCategoryCardSection = memo(() => {
  return (
    <section className="bg-card transition-colors duration-300">
      <div className="container">
        <div className="bg-card">
          {/* Responsive Layout: Scroll on mobile, Grid on larger screens */}
          <div
            className="
            overflow-x-auto lg:overflow-x-visible 
            scrollbar-hide lg:scrollbar-auto
          "
          >
            <div
              className="
              flex lg:grid lg:grid-cols-10
              gap-4 xs:gap-6 sm:gap-8 md:gap-4 lg:gap-2 xl:gap-4 2xl:gap-6
              py-2 xs:py-3 sm:py-4 
              px-2 xs:px-3 sm:px-4 lg:px-0
              min-w-max lg:min-w-0
            "
            >
              {categories.slice(0, 10).map((category, index) => {
                const Icon = category.icon;
                return (
                  <Link key={index} href={`/search?q=${category.name}`}>
                    <button
                      className="
                        flex flex-col items-center justify-center 
                        group focus:outline-none 
                        transition-transform hover:scale-105 active:scale-95 
                        flex-shrink-0 lg:flex-shrink
                        w-auto lg:w-full
                      "
                      aria-label={`Go to ${category.name} category`}
                    >
                      <div
                        className={`
                          w-14 h-14 
                          xs:w-16 xs:h-16 
                          sm:w-20 sm:h-20 
                          rounded-full bg-gradient-to-br ${category.color} 
                          flex items-center justify-center 
                          shadow-sm group-hover:shadow-md 
                          transition-all duration-200
                        `}
                      >
                        <Icon
                          className="
                            text-white
                            w-6 h-6
                            xs:w-7 xs:h-7
                            sm:w-8 sm:h-8
                          "
                        />
                      </div>
                      <h3
                        className="
                        mt-1 xs:mt-1.5 sm:mt-2 
                        text-[10px] xs:text-[11px] sm:text-xs md:text-sm lg:text-xs xl:text-sm
                        font-medium text-foreground text-center 
                        line-clamp-1 lg:line-clamp-2
                        max-w-[60px] xs:max-w-[70px] sm:max-w-[80px] md:max-w-[90px] lg:max-w-full
                        px-1
                      "
                      >
                        {category.name}
                      </h3>
                      {category.count && (
                        <p
                          className="
                          text-[9px] xs:text-[10px] sm:text-[11px] lg:text-[10px] xl:text-xs
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
