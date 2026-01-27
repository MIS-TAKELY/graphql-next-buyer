// components/page/buy-now/BuyNowHeader.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BuyNowHeaderProps {
  productSlug: string;
  productName: string;
  title?: string;
}

export function BuyNowHeader({ productSlug, productName, title = "Buy Now" }: BuyNowHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        href={`/cart`}
        className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
        Back to Cart
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
      <p className="text-gray-600 dark:text-gray-300 mt-2">
        Complete your purchase for {productName}
      </p>
    </div>
  );
}