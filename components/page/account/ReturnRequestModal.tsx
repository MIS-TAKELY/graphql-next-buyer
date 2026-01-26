
"use client";

import { useMutation } from "@apollo/client";
import { useState } from "react";
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
    const [returnType, setReturnType] = useState<"REFUND" | "REPLACEMENT">("REFUND");
    const [refundMethod, setRefundMethod] = useState<"ORIGINAL_PAYMENT" | "WALLET" | "BANK_TRANSFER">("ORIGINAL_PAYMENT");
    const [logisticsMode, setLogisticsMode] = useState<"PLATFORM_PICKUP" | "SELF_SHIP">("PLATFORM_PICKUP");

    const [createReturnRequest, { loading }] = useMutation(REQUEST_RETURN, {
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
        setReturnType("REFUND");
    };

    const handleItemToggle = (itemId: string, maxQty: number) => {
        setSelectedItems(prev => {
            const next = { ...prev };
            if (next[itemId]) {
                delete next[itemId];
            } else {
                next[itemId] = 1; // Default to 1
            }
            return next;
        });
    };

    const handleQtyChange = (itemId: string, qty: number, maxQty: number) => {
        if (qty < 1) qty = 1;
        if (qty > maxQty) qty = maxQty;
        setSelectedItems(prev => ({ ...prev, [itemId]: qty }));
    };

    const handleSubmit = () => {
        const items = Object.entries(selectedItems).map(([id, qty]) => ({
            orderItemId: id,
            quantity: qty,
            reason: reason // Applying global reason for now, could be per item
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
                    type: returnType,
                    logisticsMode,
                    refundMethod: returnType === "REFUND" ? refundMethod : null,
                    items
                }
            }
        });
    };

    const Step1Items = () => (
        <div className="space-y-4">
            <div className="text-sm font-medium mb-2">Select items to return:</div>
            {order.items.map(item => (
                <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Checkbox
                        checked={!!selectedItems[item.id]}
                        onCheckedChange={() => handleItemToggle(item.id, item.quantity)}
                    />
                    <div className="relative w-12 h-12 rounded bg-muted overflow-hidden shrink-0">
                        <Image src={item.variant.product.images[0]?.url || "/placeholder.jpg"} alt="" fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.variant.product.name}</p>
                        <p className="text-xs text-muted-foreground">Qty Purchased: {item.quantity}</p>
                    </div>
                    {selectedItems[item.id] && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs">Return Qty:</span>
                            <Input
                                type="number"
                                className="w-16 h-8"
                                value={selectedItems[item.id]}
                                onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value), item.quantity)}
                                min={1}
                                max={item.quantity}
                            />
                        </div>
                    )}
                </div>
            ))}
            <div className="flex justify-end mt-4">
                <Button onClick={() => setStep(2)} disabled={Object.keys(selectedItems).length === 0}>Next</Button>
            </div>
        </div>
    );

    const Step2Details = () => (
        <div className="space-y-4 py-2">
            <div className="space-y-2">
                <Label>Return Type</Label>
                <RadioGroup value={returnType} onValueChange={(v: any) => setReturnType(v)} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="REFUND" id="r-refund" />
                        <Label htmlFor="r-refund">Refund</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="REPLACEMENT" id="r-replace" />
                        <Label htmlFor="r-replace">Replacement</Label>
                    </div>
                </RadioGroup>
            </div>

            {returnType === "REFUND" && (
                <div className="space-y-2">
                    <Label>Refund Method</Label>
                    <Select value={refundMethod} onValueChange={(v: any) => setRefundMethod(v)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ORIGINAL_PAYMENT">Original Payment Method</SelectItem>
                            <SelectItem value="WALLET">Wallet</SelectItem>
                            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="space-y-2">
                <Label>Reason for Return</Label>
                <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="DAMAGED">Damaged Product</SelectItem>
                        <SelectItem value="WRONG_ITEM">Wrong Item Received</SelectItem>
                        <SelectItem value="SIZE_ISSUE">Size/Fit Issue</SelectItem>
                        <SelectItem value="QUALITY_ISSUE">Quality Issue</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please provide more details..."
                />
            </div>

            <div className="space-y-2">
                <Label>Upload Evidence</Label>
                <MediaUploader value={images} onChange={setImages} maxSizeMB={5} />
            </div>

            <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={handleSubmit} disabled={loading || !reason}>
                    {loading ? "Submitting..." : "Submit Request"}
                </Button>
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Return Request</DialogTitle>
                    <DialogDescription>
                        Step {step} of 2: {step === 1 ? "Select Items" : "Return Details"}
                    </DialogDescription>
                </DialogHeader>
                {step === 1 ? <Step1Items /> : <Step2Details />}
            </DialogContent>
        </Dialog>
    );
}
