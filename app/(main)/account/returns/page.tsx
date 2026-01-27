"use client";

import { useQuery, useMutation } from "@apollo/client";
import { GET_MY_RETURNS, CANCEL_RETURN_REQUEST } from "@/client/return/return.queries";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Package, Calendar, RotateCcw, ChevronRight, Clock,
    CheckCircle2, AlertCircle, Truck, Search, Info,
    Undo2, ArrowLeft, MapPin, Receipt, CreditCard,
    XCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import React, { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    REQUESTED: { color: "bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-800", icon: Clock, label: "Requested" },
    APPROVED: { color: "bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-800", icon: CheckCircle2, label: "Approved" },
    PICKUP_SCHEDULED: { color: "bg-purple-500/10 text-purple-600 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-800", icon: Calendar, label: "Pickup Scheduled" },
    IN_TRANSIT: { color: "bg-sky-500/10 text-sky-600 border-sky-200 dark:bg-sky-500/20 dark:text-sky-400 dark:border-sky-800", icon: Truck, label: "In Transit" },
    RECEIVED: { color: "bg-teal-500/10 text-teal-600 border-teal-200 dark:bg-teal-500/20 dark:text-teal-400 dark:border-teal-800", icon: Package, label: "Received" },
    INSPECTED: { color: "bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-800", icon: Search, label: "Inspected" },
    ACCEPTED: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-800", icon: CheckCircle2, label: "Completed" },
    REJECTED: { color: "bg-rose-500/10 text-rose-600 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-800", icon: AlertCircle, label: "Rejected" },
    DENIED: { color: "bg-rose-500/10 text-rose-600 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-800", icon: AlertCircle, label: "Denied" },
    CANCELLED: { color: "bg-slate-500/10 text-slate-600 border-slate-200 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-800", icon: XCircle, label: "Cancelled" },
};

const formatDate = (dateInput: any) => {
    try {
        if (!dateInput) return "N/A";

        let date: Date;
        if (typeof dateInput === 'number') {
            date = new Date(dateInput);
        } else if (typeof dateInput === 'string') {
            if (!isNaN(Number(dateInput)) && dateInput.length > 10) {
                date = new Date(Number(dateInput));
            } else {
                date = parseISO(dateInput);
            }
        } else {
            date = new Date(dateInput);
        }

        if (isNaN(date.getTime())) return "N/A";
        return format(date, "MMM dd, yyyy");
    } catch (e) {
        return "N/A";
    }
};

function ReturnDetailsSheet({ ret }: { ret: any }) {
    const status = statusConfig[ret.status] || { color: "bg-muted text-muted-foreground", icon: Clock, label: ret.status };
    const StatusIcon = status.icon;
    const [open, setOpen] = useState(false);

    const [cancelReturn, { loading: cancelling }] = useMutation(CANCEL_RETURN_REQUEST, {
        variables: { id: ret.id },
        refetchQueries: [GET_MY_RETURNS],
        onCompleted: () => {
            toast.success("Return request cancelled successfully");
            setOpen(false);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to cancel return request");
        }
    });

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button className="flex items-center justify-center gap-2 text-sm font-bold text-primary hover:text-primary/70 transition-colors group/btn">
                    Details
                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col bg-background">
                <SheetHeader className="p-6 pb-2 text-left shrink-0">
                    <div className="flex items-center justify-between mb-2">
                        <SheetTitle className="text-xl font-bold">Return Details</SheetTitle>
                        <Badge className={cn("px-3 py-1 rounded-full border shadow-none flex items-center gap-1.5 font-medium", status.color)}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {status.label}
                        </Badge>
                    </div>
                    <SheetDescription className="flex flex-col gap-1">
                        <span>Return ID: {ret.id}</span>
                        <span>Order Number: <span className="font-mono font-bold">#{ret.order?.orderNumber}</span></span>
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 scrollbar-hide pb-8">
                    <div className="py-4">
                        <h5 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2 border-b pb-2">
                            <RotateCcw className="w-4 h-4" /> Return Items
                        </h5>
                        <div className="space-y-4">
                            {ret.items.map((item: any) => (
                                <div key={item.id} className="flex gap-4 p-3 rounded-2xl bg-muted/30 dark:bg-muted/10 border border-transparent hover:border-border transition-all">
                                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border bg-white dark:bg-muted shrink-0 shadow-sm">
                                        <Image
                                            src={item.orderItem?.variant?.product?.images?.[0]?.url || "/placeholder.jpg"}
                                            alt={item.orderItem?.variant?.product?.name || "Product image"}
                                            fill
                                            className="object-cover"
                                            unoptimized // Keep unoptimized for external URLs
                                            loading="eager" // Load quickly
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <p className="font-bold text-sm line-clamp-2 leading-tight mb-1">
                                            {item.orderItem?.variant?.product?.name}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-semibold bg-background dark:bg-card px-2 py-0.5 rounded-full border shadow-xs">
                                                Qty: {item.quantity}
                                            </span>
                                            {ret.reason && (
                                                <span className="text-xs text-muted-foreground italic truncate">
                                                    Reason: {ret.reason}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                <Info className="w-4 h-4 text-primary" /> Return Summary
                            </h5>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-3 rounded-xl bg-muted/20 dark:bg-muted/5 border">
                                    <p className="text-muted-foreground text-[10px] uppercase font-bold mb-1">Return Type</p>
                                    <p className="font-bold">{ret.type || "REFUND"}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-muted/20 dark:bg-muted/5 border">
                                    <p className="text-muted-foreground text-[10px] uppercase font-bold mb-1">Refund Status</p>
                                    <p className="font-bold text-primary">{ret.refundStatus || "PENDING"}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-muted/20 dark:bg-muted/5 border col-span-2">
                                    <p className="text-muted-foreground text-[10px] uppercase font-bold mb-1">Requested On</p>
                                    <p className="font-bold">{formatDate(ret.createdAt)}</p>
                                </div>
                            </div>
                        </div>

                        {ret.description && (
                            <div className="space-y-2">
                                <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Customer Note</h5>
                                <div className="p-4 rounded-2xl bg-muted/30 dark:bg-muted/10 italic text-sm border-l-4 border-primary">
                                    "{ret.description}"
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 bg-background border-t mt-auto flex flex-col gap-3">
                    <div className="flex gap-3">
                        <Link
                            href={`/account/orders`}
                            className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-xl text-sm font-bold text-center transition-colors"
                        >
                            View Order
                        </Link>
                        <button
                            className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold text-center hover:bg-primary/90 transition-colors"
                            onClick={() => {/* Support link? */ }}
                        >
                            Need Help?
                        </button>
                    </div>

                    {ret.status === "REQUESTED" && (
                        <Button
                            variant="destructive"
                            className="w-full h-11 rounded-xl text-sm font-bold"
                            onClick={() => cancelReturn()}
                            disabled={cancelling}
                        >
                            {cancelling ? "Cancelling..." : "Cancel Return Request"}
                        </Button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

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
                <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center mb-4">
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
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-background rounded-3xl border border-dashed border-muted-foreground/20">
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
                    const status = statusConfig[ret.status] || { color: "bg-muted text-muted-foreground", icon: Clock, label: ret.status };
                    const StatusIcon = status.icon;

                    return (
                        <Card key={ret.id} className="group border shadow-sm hover:shadow-xl hover:ring-1 hover:ring-primary/10 transition-all duration-500 rounded-3xl overflow-hidden bg-white dark:bg-card">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    <div className="p-6 md:p-8 flex-1">
                                        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <Badge className={cn("px-3 py-1 rounded-full border shadow-none flex items-center gap-1.5 font-medium whitespace-nowrap", status.color)}>
                                                        <StatusIcon className="w-3.5 h-3.5" />
                                                        {status.label}
                                                    </Badge>
                                                    <Badge variant="outline" className="px-3 py-1 rounded-full border-muted-foreground/20 text-muted-foreground font-medium uppercase tracking-wider text-[10px] whitespace-nowrap">
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
                                                <div key={item.id} className="flex gap-4 items-center bg-muted/20 dark:bg-muted/10 p-4 rounded-2xl group/item hover:bg-muted/40 dark:hover:bg-muted/20 transition-colors">
                                                    <div className="relative w-16 h-16 rounded-xl border border-border dark:border-muted bg-white dark:bg-muted shadow-sm overflow-hidden shrink-0 group-hover/item:scale-105 transition-transform duration-300">
                                                        <Image
                                                            src={item.orderItem?.variant?.product?.images?.[0]?.url || "/placeholder.jpg"}
                                                            alt={item.orderItem?.variant?.product?.name || "Product image"}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                            priority // Load images with higher priority to avoid "refresh to see"
                                                        />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-bold truncate text-foreground/90">{item.orderItem?.variant?.product?.name || "Unknown Product"}</p>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                                            <span className="text-xs bg-background dark:bg-muted px-2 py-0.5 rounded-full border shadow-sm font-semibold">Qty: {item.quantity || 0}</span>
                                                            <span className="text-xs text-muted-foreground italic truncate">Reason: {ret.reason || "Change of mind"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/50 dark:bg-muted/5 border-t md:border-t-0 md:border-l border-slate-100 dark:border-muted/20 p-8 flex flex-row md:flex-col items-center justify-between md:justify-center gap-6 md:min-w-[200px]">
                                        <div className="text-center w-full">
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-3 hidden md:block">Refund Status</p>
                                            <div className="relative h-12 w-full flex items-center justify-center">
                                                <Badge variant="secondary" className="px-6 py-2 rounded-full font-bold text-sm bg-white dark:bg-muted shadow-sm border border-slate-200 dark:border-muted/20 capitalize w-full md:w-auto text-primary">
                                                    {(ret.refundStatus || "PENDING").toLowerCase()}
                                                </Badge>
                                            </div>
                                        </div>

                                        <ReturnDetailsSheet ret={ret} />
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
                        className="relative z-10 px-8 py-3 bg-white dark:bg-muted text-primary rounded-2xl font-bold shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-all hover:-translate-y-0.5"
                    >
                        Contact Support
                    </Link>
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                </div>
            </div>
        </div>
    );
}
