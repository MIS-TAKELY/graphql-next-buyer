"use client";

import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmptyOrders = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">Your order history is empty</h3>
      <p className="text-muted-foreground max-w-sm">
        Start shopping and your orders will appear here!
      </p>
      <Button variant="outline" className="mt-6 gap-2">
        <Package className="h-4 w-4" />
        Continue Shopping
      </Button>
    </div>
  );
};

export default EmptyOrders;