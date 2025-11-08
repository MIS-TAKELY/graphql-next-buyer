"use client"
import { GET_TOP_DEALS } from "@/client/landing/topdeals.query";
import { gql, useQuery } from "@apollo/client";
import { ChevronRight } from "lucide-react";
import Image from "next/image";

const ProductGrid = () => {
  const productImages = Array.from({ length: 4 });

  const query = gql`
    query GetTopDealsaveUpTo($topDealAbout: String!) {
      getTopDealsaveUpTo(topDealAbout: $topDealAbout) {
        saveUpTo
        name
        imageUrl
        imageAltText
      }
    }
  `;

  const { data, loading, error } = useQuery(GET_TOP_DEALS, {
    variables: {
      topDealAbout: "Dress",
      limit: 4,
    },
    fetchPolicy: "cache-first",
  });
  if (error) console.log(error);
  console.log("data--->", data?.getTopDealsaveUpTo);
  return (
    <div className="w-full">
      {/* Container with border on desktop, no border on mobile */}
      <div className="md:max-w-md md:border md:border-gray-200 md:rounded-md md:px-5 md:py-5 md:bg-white">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-4 px-4 md:px-0">
          <h2 className="font-semibold text-lg md:text-xl text-gray-900">
            Featured Products
          </h2>
          <div className="bg-blue-600 rounded-full flex justify-center items-center">
            <ChevronRight
              className="text-white transition-colors duration-200 cursor-pointer"
              size={24}
            />
          </div>
        </div>

        {/* Responsive Grid */}
        <div className="px-4 md:px-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-2">
            {data?.getTopDealsaveUpTo?.map((deals: any, index) => (
              <div
                key={index}
                className="group flex flex-col items-center text-center space-y-2 border border-gray-200 p-2 sm:p-3 md:p-4 rounded-md hover:border-blue-100 transition-all duration-200 ease-in-out"
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 overflow-hidden rounded-md">
                  <Image
                    src={deals?.imageUrl || ""}
                    alt={deals?.imageAltText || ""}
                    fill
                    className="object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    // placeholder="blur"
                  />
                </div>
                <div className="font-medium text-xs md:text-sm text-gray-800 line-clamp-1">
                  {deals?.name}
                </div>
                <div className="text-xs text-gray-600 font-semibold">
                  {deals?.saveUpTo}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
