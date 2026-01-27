"use client";

import { useQuery } from "@apollo/client";
import { GET_MY_RETURNS } from "@/client/return/return.queries";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Calendar, RotateCcw, ChevronRight, Clock, CheckCircle2, AlertCircle, Truck, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    REQUESTED: { color: "bg-amber-500/10 text-amber-600 border-amber-200", icon: Clock, label: "Requested" },
    APPROVED: { color: "bg-blue-500/10 text-blue-600 border-blue-200", icon: CheckCircle2, label: "Approved" },
    PICKUP_SCHEDULED: { color: "bg-purple-500/10 text-purple-600 border-purple-200", icon: Calendar, label: "Pickup Scheduled" },
    IN_TRANSIT: { color: "bg-sky-500/10 text-sky-600 border-sky-200", icon: Truck, label: "In Transit" },
    RECEIVED: { color: "bg-teal-500/10 text-teal-600 border-teal-200", icon: Package, label: "Received" },
    INSPECTED: { color: "bg-indigo-500/10 text-indigo-600 border-indigo-200", icon: Search, label: "Inspected" },
    ACCEPTED: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-200", icon: CheckCircle2, label: "Completed" },
    REJECTED: { color: "bg-rose-500/10 text-rose-600 border-rose-200", icon: AlertCircle, label: "Rejected" },
    DENIED: { color: "bg-rose-500/10 text-rose-600 border-rose-200", icon: AlertCircle, label: "Denied" },
    CANCELLED: { color: "bg-slate-500/10 text-slate-600 border-slate-200", icon: Clock, label: "Cancelled" },
};

const formatDate = (dateString: string) => {
    try {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "N/A";
        return format(date, "MMM dd, yyyy");
    } catch (e) {
        return "N/A";
    }
};

export default function MyReturnsPage() {
    const { data, loading, error } = useQuery(GET_MY_RETURNS, {
        variables: { limit: 10, offset: 0 },
        fetchPolicy: "cache-and-network",
    });

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex flex-col gap-1 mb-6">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-40 w-full rounded-2xl" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-rose-500" />
                </div>
                <h3 className="text-xl font-semibold">Failed to load returns</h3>
                <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                    We encountered an error while fetching your return requests. Please try again.
                </p>
            </div>
        );
    }

    const returns = data?.myReturns || [];

    if (returns.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border border-dashed border-muted-foreground/20">
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                    <RotateCcw className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold">No return requests found</h2>
                <p className="text-muted-foreground mt-3 max-w-sm mx-auto leading-relaxed">
                    You haven't initiated any returns yet. If you need to return an item, go to your orders and select the items you'd like to return.
                </p>
                <Link
                    href="/account/orders"
                    className="mt-8 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2 group"
                >
                    View My Orders <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-extrabold tracking-tight">My Returns</h1>
                <p className="text-muted-foreground">
                    You have <span className="text-foreground font-semibold font-mono">{returns.length}</span> active return request{returns.length !== 1 ? 's' : ''}.
                </p>
            </div>

            <div className="grid gap-6">
                {returns.map((ret: any) => {
                    const status = statusConfig[ret.status] || { color: "bg-gray-100 text-gray-700", icon: Clock, label: ret.status };
                    const StatusIcon = status.icon;

                    return (
                        <Card key={ret.id} className="group border-none shadow-sm hover:shadow-xl hover:ring-1 hover:ring-primary/10 transition-all duration-500 rounded-3xl overflow-hidden bg-white">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    <div className="p-6 md:p-8 flex-1">
                                        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <Badge className={cn("px-3 py-1 rounded-full border shadow-none flex items-center gap-1.5 font-medium", status.color)}>
                                                        <StatusIcon className="w-3.5 h-3.5" />
                                                        {status.label}
                                                    </Badge>
                                                    <Badge variant="outline" className="px-3 py-1 rounded-full border-muted-foreground/20 text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                                                        {ret.type || "REFUND"}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Requested on {formatDate(ret.createdAt)}</span>
                                                </div>
                                            </div>
                                            <div className="text-left md:text-right">
                                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Order Info</p>
                                                <p className="text-lg font-black font-mono">#{ret.order?.orderNumber || "ORD-XXXXX"}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium mt-0.5 bg-muted/50 px-2 py-0.5 rounded w-fit md:ml-auto">ID: {ret.id}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {ret.items.map((item: any) => (
                                                <div key={item.id} className="flex gap-4 items-center bg-muted/20 p-4 rounded-2xl group/item hover:bg-muted/40 transition-colors">
                                                    <div className="relative w-16 h-16 rounded-xl border border-white bg-white shadow-sm overflow-hidden shrink-0 group-hover/item:scale-105 transition-transform duration-300">
                                                        <Image
                                                            src={item.orderItem?.variant?.product?.images?.[0]?.url || "/placeholder.jpg"}
                                                            alt={item.orderItem?.variant?.product?.name || "Product image"}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-bold truncate text-foreground/90">{item.orderItem?.variant?.product?.name || "Unknown Product"}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs bg-white px-2 py-0.5 rounded-full border shadow-sm font-semibold">Qty: {item.quantity || 0}</span>
                                                            <span className="text-xs text-muted-foreground italic truncate">Reason: {ret.reason || "Change of mind"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/50 border-t md:border-t-0 md:border-l border-slate-100 p-8 flex flex-row md:flex-col items-center justify-between md:justify-center gap-6 md:min-w-[200px]">
                                        <div className="text-center w-full">
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-3 hidden md:block">Refund Status</p>
                                            <div className="relative h-12 w-full flex items-center justify-center">
                                                <Badge variant="secondary" className="px-6 py-2 rounded-full font-bold text-sm bg-white shadow-sm border border-slate-200 capitalize w-full md:w-auto text-primary">
                                                    {(ret.refundStatus || "PENDING").toLowerCase()}
                                                </Badge>
                                            </div>
                                        </div>

                                        <button className="flex items-center justify-center gap-2 text-sm font-bold text-primary hover:text-primary/70 transition-colors group/btn">
                                            Details
                                            <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="pt-8 border-t border-dashed border-muted-foreground/20">
                <div className="bg-primary/5 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                    <div className="relative z-10 flex-1">
                        <h4 className="text-xl font-bold mb-2">Need help with your return?</h4>
                        <p className="text-muted-foreground max-w-md">
                            Check our <Link href="/returns-policy" className="text-primary font-semibold hover:underline">Returns Policy</Link> or contact our 24/7 support team if you have any questions.
                        </p>
                    </div>
                    <Link
                        href="/contact"
                        className="relative z-10 px-8 py-3 bg-white text-primary rounded-2xl font-bold shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-all hover:-translate-y-0.5"
                    >
                        Contact Support
                    </Link>
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                </div>
            </div>
        </div>
    );
}
