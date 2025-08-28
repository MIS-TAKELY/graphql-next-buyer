import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrderItem from "./OrderItem";
export default function OrdersSection() {
  const orders = [
    {
      id: "1",
      orderNumber: "ORD-001",
      status: "DELIVERED",
      total: 299.99,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      orderNumber: "ORD-002",
      status: "SHIPPED",
      total: 149.5,
      createdAt: "2024-01-20",
    },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderItem key={order.id} order={order} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
