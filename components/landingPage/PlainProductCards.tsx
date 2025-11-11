"use client";
import Image from "next/image";
import Link from "next/link";
import { TopDeal } from "./types";

interface Props {
  product: TopDeal;
}

const PlainProductCards = ({ product }: Props) => {
  const categoryName = product.product?.category?.name || "Unknown";

  return (
    <Link
      href={`/search?q=${encodeURIComponent(categoryName)}`}
      className="group flex-shrink-0 w-40 xs:w-44 sm:w-48 md:w-52 lg:w-56 snap-start block hover:no-underline"
    >
      {/* Image */}
      <div className="relative h-28 xs:h-32 sm:h-36 md:h-40 lg:h-44 w-full overflow-hidden rounded-md">
        <Image
          src={product.imageUrl || "/placeholder.svg"}
          alt={product.imageAltText || "Product image"}
          fill
          sizes="(max-width: 360px) 160px, (max-width: 640px) 176px, (max-width: 768px) 192px, (max-width: 1024px) 208px, 224px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority={false}
        />
      </div>

      {/* Text */}
      <div className="text-center mt-2 xs:mt-2 sm:mt-3">
        <p className="text-xs xs:text-sm sm:text-base md:text-lg text-card-foreground line-clamp-1">
          {categoryName}
        </p>
        {product.saveUpTo && (
          <p className="text-xs xs:text-sm sm:text-base text-price font-semibold mt-1">
            Save up to{" "}
            {typeof product.saveUpTo === "number"
              ? `रु ${product.saveUpTo.toFixed(2)}`
              : product.saveUpTo}
          </p>
        )}
      </div>
    </Link>
  );
};

export default PlainProductCards;
