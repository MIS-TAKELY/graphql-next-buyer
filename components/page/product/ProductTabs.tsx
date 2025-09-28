// components/page/product/ProductTabs.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from "react";
import ProductReviews from "./ProductReviews";

interface ProductTabsProps {
  product: any;
  averageRating: number;
  mockReviews: any[];
}

export default function ProductTabs({
  product,
}: ProductTabsProps) {
  const specifications = useMemo(
    () => product?.specifications || {},
    [product]
  );
  const features = useMemo(() => product?.features || [], [product]);

  return (
    <Tabs defaultValue="specifications" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
        <TabsTrigger
          value="specifications"
          className="text-gray-900 dark:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
        >
          Specifications
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          className="text-gray-900 dark:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
        >
          Reviews
        </TabsTrigger>
        <TabsTrigger
          value="features"
          className="text-gray-900 dark:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
        >
          All Features
        </TabsTrigger>
      </TabsList>

      <TabsContent value="specifications" className="mt-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(specifications).length > 0 ? (
                Object.entries(specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      {key}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {value as string}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-300">
                  No specifications available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reviews" className="mt-6">
        <ProductReviews  />
      </TabsContent>

      <TabsContent value="features" className="mt-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
          <CardContent className="p-6">
            <ul className="space-y-3">
              {features.length > 0 ? (
                features.map((feature: string, index: number) => (
                  <li key={index} className="text-gray-700 dark:text-gray-200">
                    {feature}
                  </li>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-300">
                  No features available
                </p>
              )}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
