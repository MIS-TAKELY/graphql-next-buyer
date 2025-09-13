import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Star } from "lucide-react";
import { useMemo } from "react";

interface ProductTabsProps {
  product: any;
  averageRating: number;
  mockReviews: any[];
}

export default function ProductTabs({ product, averageRating, mockReviews }: ProductTabsProps) {
  const specifications = useMemo(() => product?.specifications || {}, [product]);
  const features = useMemo(() => product?.features || [], [product]);

  return (
    <Tabs defaultValue="specifications" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="specifications">Specifications</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="features">All Features</TabsTrigger>
      </TabsList>

      <TabsContent value="specifications" className="mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(specifications).length > 0 ? (
                Object.entries(specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600">{key}</span>
                    <span className="font-medium">{value as string}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No specifications available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reviews" className="mt-6">
        <div className="space-y-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="text-center">
              <div className="flex justify-center mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 fill-current ${
                      i < Math.floor(averageRating) ? "text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600">
                Based on {mockReviews.length} reviews
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {mockReviews.length > 0 ? (
              mockReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.user}</span>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <div className="flex mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 fill-current ${
                            i < review.rating ? "text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-600">No reviews available</p>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="features" className="mt-6">
        <Card>
          <CardContent className="p-6">
            <ul className="space-y-3">
              {features.length > 0 ? (
                features.map((feature: string, index: number) => (
                  <li key={index} className="text-gray-700">{feature}</li>
                ))
              ) : (
                <p className="text-gray-600">No features available</p>
              )}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}