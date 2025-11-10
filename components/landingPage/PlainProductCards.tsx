"use client";
import Image from "next/image";
import { TopDeal } from "./types";
interface Props {
  product: TopDeal;
}

const PlainProductCards = ({ product }: Props) => {
  return (
    <div className="group flex-shrink-0 w-36 xs:w-40 sm:w-44 md:w-48 lg:w-52 snap-start">
      {/* Image */}
      <div className="relative h-24 xs:h-28 sm:h-32 md:h-36 lg:h-40 w-full overflow-hidden ">
        <Image
          src={product.imageUrl || "/placeholder.svg"}
          alt={product.imageAltText || "Product image"}
          fill
          sizes="(max-width: 360px) 140px, (max-width: 640px) 160px, (max-width: 768px) 180px, (max-width: 1024px) 200px, 220px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority={false}
        />
      </div>
      {/* Text */}
      <div className="text-center mt-2 xs:mt-2 sm:mt-3">
        <p className="text-xs xs:text-sm sm:text-base md:text-lg text-card-foreground line-clamp-2">
          {product.name || "Unnamed Product"}
        </p>
        {product.saveUpTo && (
          <p className="text-xs xs:text-sm sm:text-base text-price font-semibold mt-1">
            Save up to{" "}
            {typeof product.saveUpTo === "number"
              ? `$${product.saveUpTo.toFixed(2)}`
              : product.saveUpTo}
          </p>
        )}
      </div>
    </div>
  );
};

export default PlainProductCards;
