import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";

interface WishlistShareButtonsProps {
  addedToWishlist: boolean;
  toggleWishlist: () => void;
}

export default function WishlistShareButtons({
  addedToWishlist,
  toggleWishlist,
}: WishlistShareButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button
        size="lg"
        variant="outline"
        onClick={toggleWishlist}
        className={`${addedToWishlist ? "text-red-500 border-red-500" : ""}`}
      >
        <Heart className={`w-5 h-5 ${addedToWishlist ? "fill-current" : ""}`} />
      </Button>
      <Button size="lg" variant="outline">
        <Share2 className="w-5 h-5" />
      </Button>
    </div>
  );
}