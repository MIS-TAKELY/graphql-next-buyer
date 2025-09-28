"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Plus } from "lucide-react";

export const NoReviews = ({ onAddReview }: { onAddReview?: () => void }) => {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <div className="text-gray-400 mb-2">
          <Star className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No reviews yet
        </h3>
        <p className="text-gray-600 mb-4">
          Be the first to review this product!
        </p>
        {onAddReview && (
          <Button onClick={onAddReview} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Write a Review
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
