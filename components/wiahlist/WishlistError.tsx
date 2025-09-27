import { AlertCircle } from "lucide-react";
import { Button } from "../ui/button";

const WishlistError = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="font-semibold text-lg mb-2">Unable to load wishlist</h3>
      <p className="text-muted-foreground max-w-sm mb-4">
        Something went wrong while fetching your wishlist. Please try again.
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Retry
      </Button>
    </div>
  );
};

export default WishlistError;
