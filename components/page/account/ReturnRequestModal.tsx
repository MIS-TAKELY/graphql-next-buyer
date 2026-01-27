"use client";

import { useMutation } from "@apollo/client";
import { useState, useMemo, useEffect } from "react";
import { REQUEST_RETURN, GET_MY_ORDER_ITEMS } from "@/client/order/order.queries";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaUploader } from "@/components/review/MediaUploader";
import { ReviewMedia } from "@/components/review/types";
import { toast } from "sonner";
import { Order } from "./OrderItem";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { AlertCircle, ArrowLeft, ArrowRight, Package, ShieldCheck, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ReturnRequestModalProps {
    order: Order;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ReturnRequestModal({ order, open, onOpenChange }: ReturnRequestModalProps) {
    const [step, setStep] = useState(1);
    const [selectedItems, setSelectedItems] = useState<Record<string, number>>({}); // itemId -> quantity
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState<ReviewMedia[]>([]);
    const [refundMethod, setRefundMethod] = useState<"ORIGINAL_PAYMENT" | "WALLET" | "BANK_TRANSFER">("ORIGINAL_PAYMENT");
    const [logisticsMode, setLogisticsMode] = useState<"PLATFORM_PICKUP" | "SELF_SHIP">("PLATFORM_PICKUP");

    // Automatically derive return type from product info
    const derivedReturnType = useMemo(() => {
        const itemIds = Object.keys(selectedItems);
        if (itemIds.length === 0) return "REFUND";

        // Logic: if any selected item's policy says REPLACEMENT, we might use that.
        // But usually, it's determined by the most restrictive or specific policy.
        // User asked: "dont let user choose, show return type based on sellers product info"
        const policies = itemIds.map(id => {
            const item = order.items.find(i => i.id === id);
            return item?.variant?.product?.returnPolicy?.[0]?.type || "REFUND";
        });

        // For now, if all/primary are REFUND, use REFUND. If any is REPLACEMENT, maybe restrict to that?
        // Let's stick to the first selected item's policy as the primary driver for simplicity
        // or prioritize REPLACEMENT if it exists in any selected item.
        return policies.includes("REPLACEMENT") ? "REPLACEMENT" : "REFUND";
    }, [selectedItems, order.items]);

    const [createReturnRequest, { loading }] = useMutation(REQUEST_RETURN, {
        optimisticResponse: {
            createReturnRequest: {
                id: "temp-id-" + Date.now(),
                status: "REQUESTED",
                type: derivedReturnType,
                __typename: "Return"
            }
        },
        refetchQueries: [GET_MY_ORDER_ITEMS],
        onCompleted: () => {
            toast.success("Return request submitted successfully");
            onOpenChange(false);
            resetForm();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to submit return request");
        }
    });

    const resetForm = () => {
        setStep(1);
        setSelectedItems({});
        setReason("");
        setDescription("");
        setImages([]);
    };

    const handleItemToggle = (itemId: string, maxQty: number) => {
        setSelectedItems(prev => {
            const next = { ...prev };
            if (next[itemId]) {
                delete next[itemId];
            } else {
                next[itemId] = 1;
            }
            return next;
        });
    };

    const handleQtyChange = (itemId: string, qty: number, maxQty: number) => {
        let val = typeof qty === 'number' ? qty : 1;
        if (val < 1) val = 1;
        if (val > maxQty) val = maxQty;
        setSelectedItems(prev => ({ ...prev, [itemId]: val }));
    };

    const handleSubmit = () => {
        const items = Object.entries(selectedItems).map(([id, qty]) => ({
            orderItemId: id,
            quantity: qty,
            reason: reason
        }));

        if (items.length === 0) {
            toast.error("Please select at least one item to return");
            return;
        }

        createReturnRequest({
            variables: {
                input: {
                    orderId: order.id,
                    reason,
                    description,
                    images: images.map(img => img.url),
                    type: derivedReturnType,
                    logisticsMode,
                    refundMethod: derivedReturnType === "REFUND" ? refundMethod : "ORIGINAL_PAYMENT",
                    items
                }
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-[550px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white dark:bg-zinc-900">
                <DialogHeader className="p-6 md:p-8 bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <RotateCcw className="w-5 h-5 text-primary" />
                        </div>
                        <DialogTitle className="text-xl md:text-2xl font-bold">Return Request</DialogTitle>
                    </div>
                    <DialogDescription className="text-sm font-medium">
                        Step {step} of 2: {step === 1 ? "Select items from your order" : "Tell us what happened"}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 md:p-8 overflow-y-auto max-h-[70vh] scrollbar-thin">
                    {step === 1 ? (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            {order.items.map(item => {
                                // Calculate how many have already been returned
                                const totalReturnedQty = order.returns?.reduce((acc, ret) => {
                                    const returnItem = ret.items.find(ri => ri.orderItem.id === item.id);
                                    return acc + (returnItem ? returnItem.quantity : 0);
                                }, 0) || 0;

                                const remainingQty = item.quantity - totalReturnedQty;
                                const policy = item.variant?.product?.returnPolicy?.[0];
                                const isNonReturnable = policy?.type === "NO_RETURN";

                                // If already fully returned or non-returnable, don't show in the selection list
                                if (remainingQty <= 0 || isNonReturnable) return null;

                                return (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            "flex items-center gap-4 p-4 border rounded-2xl transition-all duration-300",
                                            selectedItems[item.id]
                                                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                                : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
                                        )}
                                    >
                                        <Checkbox
                                            id={`item-${item.id}`}
                                            checked={!!selectedItems[item.id]}
                                            onCheckedChange={() => handleItemToggle(item.id, remainingQty)}
                                            className="w-5 h-5 rounded-md"
                                        />
                                        <div className="relative w-16 h-16 rounded-xl bg-slate-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-slate-200 dark:border-zinc-800">
                                            <Image src={item.variant.product.images[0]?.url || "/placeholder.jpg"} alt="" fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <label htmlFor={`item-${item.id}`} className="text-sm font-bold block truncate text-foreground mb-1 cursor-pointer">
                                                {item.variant.product.name}
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider px-2 py-0">
                                                    Purchased: {item.quantity}
                                                </Badge>
                                                {totalReturnedQty > 0 && (
                                                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider px-2 py-0 border-amber-200 text-amber-700 bg-amber-50">
                                                        Already Returned: {totalReturnedQty}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        {selectedItems[item.id] && (
                                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Qty to Return</span>
                                                <Input
                                                    type="number"
                                                    className="w-16 h-9 rounded-lg font-bold text-center"
                                                    value={selectedItems[item.id]}
                                                    onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value), remainingQty)}
                                                    min={1}
                                                    max={remainingQty}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <div className="flex justify-end pt-4 border-t border-dashed mt-6">
                                <Button
                                    onClick={() => setStep(2)}
                                    className="px-8 py-6 rounded-2xl font-bold gap-2 group shadow-lg shadow-primary/20"
                                    disabled={Object.keys(selectedItems).length === 0}
                                >
                                    Next Step <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30 flex gap-3">
                                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Seller Policy Applies</p>
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                        Based on the seller's policy, this return will be processed as a <span className="underline decoration-2 underline-offset-4">{derivedReturnType}</span>.
                                    </p>
                                </div>
                            </div>

                            {derivedReturnType === "REFUND" && (
                                <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Refund Method</Label>
                                    <Select value={refundMethod} onValueChange={(v: any) => setRefundMethod(v)}>
                                        <SelectTrigger className="h-12 rounded-xl font-medium border-slate-200 dark:border-zinc-800 focus:ring-primary/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="ORIGINAL_PAYMENT" className="py-2.5">Original Payment Method</SelectItem>
                                            <SelectItem value="WALLET" className="py-2.5">Wallet Balance</SelectItem>
                                            <SelectItem value="BANK_TRANSFER" className="py-2.5">Bank Transfer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Reason for Return</Label>
                                <Select value={reason} onValueChange={setReason}>
                                    <SelectTrigger className="h-12 rounded-xl font-medium border-slate-200 dark:border-zinc-800 focus:ring-primary/20">
                                        <SelectValue placeholder="Why are you returning this?" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="DAMAGED" className="py-2.5">Damaged Product</SelectItem>
                                        <SelectItem value="WRONG_ITEM" className="py-2.5">Wrong Item Received</SelectItem>
                                        <SelectItem value="SIZE_ISSUE" className="py-2.5">Size/Fit Issue</SelectItem>
                                        <SelectItem value="QUALITY_ISSUE" className="py-2.5">Quality Issue</SelectItem>
                                        <SelectItem value="OTHER" className="py-2.5">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description (Optional)</Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Tell us a bit more about the issue..."
                                    className="min-h-[100px] rounded-2xl border-slate-200 dark:border-zinc-800 focus:ring-primary/20 p-4"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Photos</Label>
                                <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                                    <MediaUploader value={images} onChange={setImages} maxSizeMB={5} />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-dashed">
                                <Button
                                    variant="ghost"
                                    onClick={() => setStep(1)}
                                    className="flex-1 h-14 rounded-2xl font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading || !reason}
                                    className="flex-[2] h-14 rounded-2xl font-bold shadow-lg shadow-primary/20"
                                >
                                    {loading ? "Submitting..." : "Submit Return Request"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Consumer Protection Guaranteed</span>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Sub-components are removed to avoid the re-mounting focus bug.
// All logic is now kept within the main component or utility hooks.
