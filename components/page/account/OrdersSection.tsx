"use client";

import { GET_MY_ORDER_ITEMS } from "@/client/order/order.queries";
import EmptyOrders from "@/components/order/EmptyOrders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@apollo/client";
import { useMemo, useState } from "react";
import OrderItem, { GetMyOrderItemsResponse } from "./OrderItem";
import OrderItemSkeleton from "./OrderItemSkeleton";

const SKELETONS = Array.from({ length: 2 });
const PAGE_SIZE = 5; // number of orders per page

export default function OrdersSection() {
  const [page, setPage] = useState(0);

  const { data, loading, error, fetchMore } = useQuery<GetMyOrderItemsResponse>(
    GET_MY_ORDER_ITEMS,
    {
      variables: { limit: PAGE_SIZE, offset: page * PAGE_SIZE },
      fetchPolicy: "cache-first",
    }
  );

  const orders = useMemo(
    () => data?.getMyOrderItems ?? [],
    [data?.getMyOrderItems]
  );

  if (error) {
    return <div className="text-red-500">Failed to load orders</div>;
  }

  const handleNext = () => {
    setPage((prev) => prev + 1);
    fetchMore({
      variables: { limit: PAGE_SIZE, offset: (page + 1) * PAGE_SIZE },
    });
  };

  const handlePrev = () => {
    if (page > 0) {
      setPage((prev) => prev - 1);
      fetchMore({
        variables: { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE },
      });
    }
  };

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>My Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 && !loading ? (
          <EmptyOrders />
        ) : (
          <div>
            <div className="space-y-4 md:space-y-6">
              {loading
                ? SKELETONS.map((_, i) => <OrderItemSkeleton key={i} />)
                : orders.map((order) => (
                  <OrderItem
                    key={order.id}
                    order={order as any}
                  />
                ))}
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-between mt-6">
              <Button
                onClick={handlePrev}
                disabled={page === 0 || loading}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={orders.length < PAGE_SIZE || loading}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
