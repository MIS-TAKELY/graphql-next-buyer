// OrderItem.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import OrderTracker from "@/components/order/OrderTracker";

type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | string;

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: string;
  status: OrderStatus;
}

// OrderItem returned from GraphQL
export interface OrderItem {
  id: string;
  items: [
    { order: Order }
  ];
}

// export interface OrderItem {
//   id: string;
//   order: Order;
// }

// Root query response
export interface GetMyOrderItemsResponse {
  getMyOrderItems: OrderItem[];
}

function getStatusColor(status: OrderStatus) {
  switch (status) {
    case "DELIVERED":
      return "text-green-600";
    case "SHIPPED":
      return "text-blue-600";
    case "PROCESSING":
      return "text-yellow-600";
    case "CANCELLED":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

interface OrderItemProps {
  order: Order;
}

function OrderItemComponent({ order }: OrderItemProps) {
  console.log("order-->", order)
  return (
    <Card className="border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Order #{order?.orderNumber}</p>
            <p className="text-sm text-muted-foreground">
              Placed on {new Date(order?.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold">${order?.total}</p>
            <p
              className={`text-sm font-medium ${getStatusColor(order?.status)}`}
            >
              {order?.status}
            </p>
          </div>
        </div>


        <div className="mt-4 border-t pt-4">
          <OrderTracker status={order?.status as any} />
        </div>

        <div className="flex justify-end mt-3 space-x-2">
          <Button variant="outline" size="sm">
            View Details
          </Button>
          {order?.status === "DELIVERED" && (
            <Button variant="outline" size="sm">
              Reorder
            </Button>
          )}
        </div>
      </CardContent>
    </Card >
  );
}

export default React.memo(OrderItemComponent);
