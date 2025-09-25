// components/cart/CartError.tsx
import { Button } from "../ui/button";
import Link from "next/link";

const CartError = () => {
  return (
    <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 bg-gray-50 dark:bg-gray-900">
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2 text-red-600 dark:text-red-400">
          Error loading cart
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">Please try again later.</p>
        <Link href="/">
          <Button 
            size="lg" 
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CartError;