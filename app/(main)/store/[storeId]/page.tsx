
import { GET_PRODUCTS_BY_SELLER } from "@/client/product/product.queries";
import ProductCard from "@/components/page/home/ProductCard";
import { Button } from "@/components/ui/button";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { TProduct } from "@/types/product";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { stripTypename } from "@/lib/utils/serialize";

interface PageProps {
  params: {
    storeId: string;
  };
}

export default async function StorePage({ params }: PageProps) {
  const client = await getServerApolloClient();
  const { storeId } = await params;

  let products: TProduct[] = [];
  let sellerName = "Store";
  let error = null;

  const groupedProducts: Record<string, TProduct[]> = {};

  try {
    const { data } = await client.query({
      query: GET_PRODUCTS_BY_SELLER,
      variables: { sellerId: storeId },
      fetchPolicy: "no-cache",
    });

    // Strip __typename from GraphQL response for Client Component compatibility
    products = stripTypename(data?.getProductsBySeller || []);

    if (products.length > 0) {
      products.forEach((product) => {
        const categoryName = product.category?.name || "Other";
        if (!groupedProducts[categoryName]) {
          groupedProducts[categoryName] = [];
        }
        groupedProducts[categoryName].push(product);
      });
    }

  } catch (err: any) {
    console.error("Error fetching store products:", err);
    error = err.message || "Failed to load products";
  }

  const categoryNames = Object.keys(groupedProducts).sort();

  return (
    <div className="container-custom py-8 min-h-screen">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{sellerName}</h1>
          <p className="text-gray-500 text-sm">{products.length} Products</p>
        </div>
      </div>

      {error ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <p className="text-red-500 mb-2">Error loading store</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No products found for this store.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {categoryNames.map((categoryName) => (
            <div key={categoryName}>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">{categoryName}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {groupedProducts[categoryName].map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
