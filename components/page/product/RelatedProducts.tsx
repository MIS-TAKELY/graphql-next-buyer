import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface RelatedProduct {
  id: string;
  title: string;
  image: string;
  rating: number;
  price: number;
  originalPrice: number;
}

interface RelatedProductsProps {
  relatedProducts: RelatedProduct[];
}

export default function RelatedProducts({ relatedProducts }: RelatedProductsProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Related Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((relatedProduct) => (
          <Link key={relatedProduct.id} href={`/product/${relatedProduct.id}`}>
            <Card className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer">
              <CardContent className="p-4">
                <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100 relative">
                  <Image
                    src={relatedProduct.image || "/placeholder.svg"}
                    alt={relatedProduct.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-medium text-sm mb-2 line-clamp-2">{relatedProduct.title}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 fill-current ${i < Math.floor(relatedProduct.rating) ? "text-yellow-400" : "text-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({relatedProduct.rating})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">${relatedProduct.price}</span>
                  <span className="text-sm text-gray-500 line-through">${relatedProduct.originalPrice}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
