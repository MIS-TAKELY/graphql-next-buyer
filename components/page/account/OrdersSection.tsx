"use client";

import { GET_MY_ORDER_ITEMS } from "@/client/order/order.queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@apollo/client";
import OrderItem, { GetMyOrderItemsResponse } from "./OrderItem";
import OrderItemSkeleton from "./OrderItemSkeleton";
import { useMemo } from "react";

const SKELETONS = Array.from({ length: 2 });

export default function OrdersSection() {
  const { data, loading, error } =
    useQuery<GetMyOrderItemsResponse>(GET_MY_ORDER_ITEMS);

  if (error) {
    return <div className="text-red-500">Failed to load orders</div>;
  }
console.log("data-->",data)
  const orders = useMemo(
    () => data?.getMyOrderItems ?? [],
    [data?.getMyOrderItems]
  );
console.log("orders arranged-->",orders)
  return (
    <Card className="min-h-screen">
      <CardHeader>
        <CardTitle>My Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {loading
            ? SKELETONS.map((_, i) => <OrderItemSkeleton key={i} />)
            : orders.map((orderItem) => (
                <OrderItem key={orderItem.id} order={orderItem.items[0].order} />
              ))}
        </div>
      </CardContent>
    </Card>
  );
}
