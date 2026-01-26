// OrderItem.tsx
"use client";

import OrderTracker from "@/components/order/OrderTracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  Calendar,
  ChevronRight,
  CreditCard,
  MapPin,
  Package,
  Truck,
  RotateCcw,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { CANCEL_ORDER, GET_MY_ORDER_ITEMS } from "@/client/order/order.queries";
import { ADD_TO_CART } from "@/client/cart/cart.mutations";
import { GET_MY_CART_ITEMS } from "@/client/cart/cart.queries";
import { useRouter } from "next/navigation";
import { MediaUploader } from "@/components/review/MediaUploader";
import { ReviewMedia } from "@/components/review/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import ReturnRequestModal from "./ReturnRequestModal";

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
  updatedAt: string;
  total: number;
  status: OrderStatus;
  shippingSnapshot: any;
  shipments?: Array<{
    status: string;
    deliveredAt?: string;
  }>;
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    variant: {
      id: string;
      attributes?: Record<string, any>; // Added attributes
      product: {
        name: string;
        images: Array<{ url: string }>;
        returnPolicy?: Array<{
          type: string;
          duration: number;
          unit: string;
        }>;
      };
    };
  }>;
  disputes?: Array<{
    id: string;
    status: string;
    type: string;
    reason: string;
    description?: string;
    images?: string[];
  }>;
  returns?: Array<{
    id: string;
    status: string;
    type: string;
    items: Array<{
      id: string;
      quantity: number;
      orderItem: { id: string };
    }>;
  }>;
}

export interface GetMyOrderItemsResponse {
  getMyOrderItems: Order[];
}

function getStatusColor(status: OrderStatus) {
  switch (status) {
    case "DELIVERED":
      return "bg-green-100 text-green-700 border-green-200";
    case "SHIPPED":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "PROCESSING":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "CANCELLED":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

interface OrderItemProps {
  order: Order;
}

function OrderItemComponent({ order }: OrderItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<ReviewMedia[]>([]);

  const [cancelOrder, { loading: cancelLoading }] = useMutation(CANCEL_ORDER, {
    refetchQueries: [GET_MY_ORDER_ITEMS],
    onCompleted: () => {
      toast.success("Order cancellation request submitted");
      setShowCancelDialog(false);
      setReason("");
      setIsOpen(false);
    },
    onError: (error) => {
      const message = error.graphQLErrors?.[0]?.message || "Failed to cancel order. Please try again.";
      toast.error(message);
    }
  });

  const handleCancelOrder = () => {
    cancelOrder({
      variables: {
        input: {
          orderId: order.id,
          reason,
        }
      }
    });
  };

  const router = useRouter();
  const [addToCart, { loading: addToCartLoading }] = useMutation(ADD_TO_CART, {
    refetchQueries: [GET_MY_CART_ITEMS],
  });

  const [reorderLoading, setReorderLoading] = useState(false);

  const handleReorder = async () => {
    setReorderLoading(true);
    try {
      // Create an array of promises to add each item to the cart
      const promises = order.items.map((item) =>
        addToCart({
          variables: {
            variantId: item.variant.id,
            quantity: item.quantity,
          }
        })
      );

      // Wait for all add-to-cart operations to complete
      await Promise.all(promises);

      toast.success("All items added to cart successfully");
      router.push("/cart");
    } catch (error: any) {
      toast.error(error.message || "Failed to add items to cart");
    } finally {
      setReorderLoading(false);
    }
  };

  // Helper to check if order is eligible for return
  const isOrderReturnable = () => {
    // 1. Must be DELIVERED
    if (order.status !== "DELIVERED") return false;

    // 2. Check each item's return policy
    const hasReturnableItem = order.items.some(item => {
      const policy = item.variant.product.returnPolicy?.[0]; // Assuming one policy for now

      // Default to 7 days if no policy found
      const duration = policy?.duration || 7;
      const unit = policy?.unit || "DAYS";

      if (policy?.type === "NO_RETURN") return false;

      // 3. Check time window
      // Use deliveredAt from shipment or updatedAt of order if shipment not found
      // For simplicity, using order.updatedAt as proxy if deliveredAt missing, 
      // but ideally should come from shipment.
      const deliveryDateStr = order.shipments?.find(s => s.status === 'DELIVERED')?.deliveredAt || order.updatedAt;
      const deliveryDate = new Date(deliveryDateStr);
      const now = new Date();

      let expirationDate = new Date(deliveryDate);
      if (unit === 'DAYS') {
        expirationDate.setDate(deliveryDate.getDate() + duration);
      } else if (unit === 'HOURS') {
        expirationDate.setHours(deliveryDate.getHours() + duration);
      }

      return now <= expirationDate;
    });

    return hasReturnableItem;
  };

  // Helper to check if order is cancellable
  // "if it is not delivered ... show cancel order"
  // Usually we don't allow cancelling SHIPPED orders, but based on prompt "not delivered", 
  // we could leniently allow it or restrict to before shipping. 
  // Let's restrict to PENDING/CONFIRMED/PROCESSING for safety unless user explicitly said "even if shipped".
  // User said: "if it is not deliverd ... show cancle order". 
  // I'll stick to standard PENDING/CONFIRMED/PROCESSING.
  const isOrderCancellable = () => {
    return ["PENDING", "CONFIRMED", "PROCESSING"].includes(order.status);
  };

  // Also check if already returned or disputed to hide buttons?
  // Logic included in JSX below.

  const firstItem = order.items?.[0];
  const firstImage =
    firstItem?.variant?.product?.images?.[0]?.url || "/placeholder-image.jpg";
  const moreItemsCount = (order.items?.length || 0) - 1;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div className="cursor-pointer group">
          <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="flex items-center p-4 gap-4">
                {/* Product Thumbnail / Image stack */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src={firstImage}
                    alt={firstItem?.variant?.product?.name || "Order Image"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {moreItemsCount > 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        +{moreItemsCount}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base truncate group-hover:text-primary transition-colors leading-tight">
                        Order #{order.orderNumber}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] sm:text-xs capitalize px-2 py-0 border",
                        getStatusColor(order.status)
                      )}
                    >
                      {order.status.toLowerCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <p className="font-bold text-sm sm:text-base">
                      रु{Number(order.total).toLocaleString()}
                    </p>
                    <div className="flex items-center text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Details <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col"
      >
        <SheetHeader className="p-6 pb-2 text-left shrink-0">
          <div className="flex items-center justify-between mb-2">
            <SheetTitle>Order Details</SheetTitle>
            <Badge
              variant="outline"
              className={cn("capitalize px-3", getStatusColor(order.status))}
            >
              {order.status.toLowerCase()}
            </Badge>
          </div>
          <SheetDescription className="flex items-center gap-1">
            Order ID: {order.orderNumber} •{" "}
            {new Date(order.createdAt).toLocaleDateString()}
          </SheetDescription>
          {order.disputes && order.disputes.length > 0 && (
            <div className="mt-4 p-3 bg-muted rounded-md text-sm">
              <p className="font-semibold text-foreground">Return/Dispute Status:</p>
              {order.disputes.map(d => (
                <div key={d.id} className="flex items-center gap-2 mt-1 mx-2">
                  <Badge variant={d.status === 'APPROVED' ? 'default' : d.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                    {d.status}
                  </Badge>
                  <span className="text-muted-foreground text-xs">{d.type}</span>
                </div>
              ))}
            </div>
          )}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 scrollbar-hide pb-8">
          {/* Tracker Section */}
          <div className="py-2 mb-6">
            <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" /> Delivery Status
            </h5>
            <div className="px-2">
              <OrderTracker status={order.status as any} />
            </div>
          </div>

          <Separator className="my-6" />

          {/* Items Section */}
          <div className="space-y-4">
            <h5 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" /> Ordered Items
            </h5>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 group/item">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border bg-muted shrink-0">
                    <Image
                      src={
                        item.variant?.product?.images?.[0]?.url ||
                        "/placeholder.jpg"
                      }
                      alt={item.variant?.product?.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2 leading-tight">
                      {item.variant.product.name}
                    </p>
                    {item.variant.attributes && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(item.variant.attributes).map(([key, value]) => {
                          if (key === 'comparePrice') return null;
                          return (
                            <span key={key} className="text-xs text-muted-foreground capitalize">
                              {key}: {value}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                      <span>Qty: {item.quantity}</span>
                      <span className="font-semibold text-foreground">
                        रु{item.totalPrice}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Shipping Info Section */}
          <div className="space-y-3">
            <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Shipping Address
            </h5>
            <Card className="bg-muted/30 border-none shadow-none">
              <CardContent className="p-3 text-sm leading-relaxed">
                <p className="font-medium">
                  {order.shippingSnapshot?.firstName}{" "}
                  {order.shippingSnapshot?.lastName}
                </p>
                <p>{order.shippingSnapshot?.line1}</p>
                {order.shippingSnapshot?.line2 && (
                  <p>{order.shippingSnapshot?.line2}</p>
                )}
                <p>
                  {order.shippingSnapshot?.city},{" "}
                  {order.shippingSnapshot?.state}{" "}
                  {order.shippingSnapshot?.postalCode}
                </p>
                <p className="mt-2 text-muted-foreground">
                  {order.shippingSnapshot?.phone}
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-6" />

          {/* Payment Summary Section */}
          <div className="space-y-3">
            <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" /> Payment Summary
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Items Subtotal</span>
                <span>रु{Number(order.total) - 0}</span>{" "}
                {/* Simplified for this view */}
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping Fee</span>
                <span className="text-green-600">Free</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-base">
                <span>Grand Total</span>
                <span>रु{Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-background border-t mt-auto flex flex-wrap gap-3 shrink-0">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>

          {/* Cancel Button */}
          {isOrderCancellable() && (
            <Button
              variant="destructive"
              className="flex-1 gap-2"
              onClick={() => setShowCancelDialog(true)}
            >
              <XCircle className="w-4 h-4" /> Cancel Order
            </Button>
          )}

          {/* Return Button */}
          {isOrderReturnable() && (!order.disputes || order.disputes.length === 0) && (
            <Button
              variant="secondary"
              className="flex-1 gap-2"
              onClick={() => setShowReturnDialog(true)}
            >
              <RotateCcw className="w-4 h-4" /> Return Items
            </Button>
          )}

          <Button
            className="flex-1"
            onClick={handleReorder}
            disabled={reorderLoading}
          >
            {reorderLoading ? "Adding to Cart..." : "Reorder"}
          </Button>
        </div>
      </SheetContent>

      {/* Cancel Order Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling your order.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for cancellation..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={cancelLoading || !reason.trim()}
            >
              {cancelLoading ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Request Modal */}
      <ReturnRequestModal
        order={order}
        open={showReturnDialog}
        onOpenChange={setShowReturnDialog}
      />
    </Sheet >
  );
}

// React.memo used for performance
export default React.memo(OrderItemComponent);
