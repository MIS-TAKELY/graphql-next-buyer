

 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WishlistSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Wishlist</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground py-8">
          Your wishlist is empty. Start adding items you love!
        </p>
      </CardContent>
    </Card>
  );
}
