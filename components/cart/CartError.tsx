import { Link } from "lucide-react";
import { Button } from "../ui/button";

const CartError = () => {
  return (
    <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2 text-red-600">
          Error loading cart
        </h2>
        <p className="text-gray-600 mb-8">Please try again later.</p>
        <Link href="/">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
};

export default CartError;
