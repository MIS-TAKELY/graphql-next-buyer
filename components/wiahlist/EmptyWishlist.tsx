import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

const EmptyWishlist = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Heart className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">Your wishlist is empty</h3>
      <p className="text-muted-foreground max-w-sm">
        Start adding items you love and they'll appear here!
      </p>
      <Link href={"/"}>
        <Button variant="outline" className="mt-6 gap-2">
          <ShoppingBag className="h-4 w-4" />
          Continue Shopping
        </Button>
      </Link>
    </div>
  );
};

export default EmptyWishlist;
