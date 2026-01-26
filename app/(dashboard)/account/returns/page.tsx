"use client";

import { useQuery } from "@apollo/client";
import { GET_MY_RETURNS } from "@/client/return/return.queries";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Calendar, RotateCcw, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
    REQUESTED: "bg-yellow-100 text-yellow-700 border-yellow-200",
    APPROVED: "bg-blue-100 text-blue-700 border-blue-200",
    PICKUP_SCHEDULED: "bg-purple-100 text-purple-700 border-purple-200",
    IN_TRANSIT: "bg-orange-100 text-orange-700 border-orange-200",
    RECEIVED: "bg-teal-100 text-teal-700 border-teal-200",
    INSPECTED: "bg-indigo-100 text-indigo-700 border-indigo-200",
    ACCEPTED: "bg-green-100 text-green-700 border-green-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
    DENIED: "bg-red-100 text-red-700 border-red-200",
    CANCELLED: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function MyReturnsPage() {
    const { data, loading, error } = useQuery(GET_MY_RETURNS, {
        variables: { limit: 10, offset: 0 },
        fetchPolicy: "cache-and-network",
    });

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20">
                <p className="text-muted-foreground">Failed to load returns. Please try again.</p>
            </div>
        );
    }

    const returns = data?.myReturns || [];

    if (returns.length === 0) {
        return (
            <Card className="border-dashed flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <RotateCcw className="w-8 h-8 text-muted-foreground" />
                </div>
                <CardTitle>No returns yet</CardTitle>
                <CardDescription className="mt-2">
                    You haven't requested any returns.
                </CardDescription>
                <Link href="/account/orders" className="mt-6 text-primary font-medium hover:underline">
                    View Orders
                </Link>
            </Card>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Returns</h1>
                <p className="text-muted-foreground mt-1">
                    Track the status of your return requests.
                </p>
            </div>

            <div className="grid gap-4">
                {returns.map((ret: any) => (
                    <Card key={ret.id} className="overflow-hidden hover:border-primary/30 transition-all duration-300">
                        <CardContent className="p-0">
                            <div className="flex flex-col sm:flex-row">
                                <div className="p-4 flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={cn("capitalize", statusColors[ret.status])}>
                                                    {ret.status.replace(/_/g, " ").toLowerCase()}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                                    {ret.type}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                <Calendar className="w-3 h-3" />
                                                Requested on {new Date(ret.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-sm">Order #{ret.order.orderNumber}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">ID: {ret.id.slice(-8)}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {ret.items.map((item: any) => (
                                            <div key={item.id} className="flex gap-3 items-center">
                                                <div className="relative w-12 h-12 rounded border bg-muted overflow-hidden shrink-0">
                                                    <Image
                                                        src={item.orderItem.variant.product.images[0]?.url || "/placeholder.jpg"}
                                                        alt={item.orderItem.variant.product.name}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium truncate">{item.orderItem.variant.product.name}</p>
                                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-muted/30 border-t sm:border-t-0 sm:border-l p-4 flex sm:flex-col items-center justify-between sm:justify-center gap-4 min-w-[140px]">
                                    <div className="text-center w-full">
                                        <p className="text-xs text-muted-foreground uppercase tracking-tight font-bold mb-1 sm:block hidden">Refund Status</p>
                                        <Badge variant="secondary" className="capitalize">
                                            {ret.refundStatus.toLowerCase()}
                                        </Badge>
                                    </div>
                                    {/* <Button variant="ghost" size="sm" className="w-full gap-1 group">
                                        Details <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </Button> */}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
