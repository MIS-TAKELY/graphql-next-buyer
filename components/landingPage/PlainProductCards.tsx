"use client";
import Image from "next/image";
import { Product } from "./types";

interface PlainProductCardsProps {
  product: Product & {
    imageUrl?: string;
    imageAltText?: string;
    name?: string;
    saveUpTo?: string | number;
  };
}

const PlainProductCards = ({ product }: PlainProductCardsProps) => {
  return (
    <div className="group flex-shrink-0 w-32 xs:w-36 sm:w-44 md:w-52 snap-start">
      {/* Image */}
      <div className="relative h-28 xs:h-32 sm:h-40 md:h-48 w-full overflow-hidden ">
        <Image
          src={product.imageUrl || "/placeholder.svg"}
          alt={product.imageAltText || "Product image"}
          fill
          sizes="(max-width: 360px) 128px, (max-width: 640px) 144px, (max-width: 768px) 176px, 208px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority={false}
        />
      </div>
      {/* Text */}
      <div className="text-center mt-2 xs:mt-2 sm:mt-3">
        <p className="text-xs xs:text-sm sm:text-base text-card-foreground line-clamp-1">
          {product.name || "Unnamed Product"}
        </p>
        {product.saveUpTo && (
          <p className="text-xs xs:text-sm sm:text-[#2ECC71] font-semibold text-price mt-1">
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