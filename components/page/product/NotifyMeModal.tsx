"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone } from "lucide-react";

interface NotifyMeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: { email?: string; phone?: string }) => void;
    isLoading?: boolean;
    productName?: string;
}

export function NotifyMeModal({
    open,
    onOpenChange,
    onSubmit,
    isLoading = false,
    productName,
}: NotifyMeModalProps) {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [activeTab, setActiveTab] = useState<"email" | "phone">("email");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeTab === "email" && email) {
            onSubmit({ email });
        } else if (activeTab === "phone" && phone) {
            onSubmit({ phone });
        }
    };

    const isValid =
        (activeTab === "email" && email.includes("@")) ||
        (activeTab === "phone" && phone.length >= 10);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Notify Me When Available</DialogTitle>
                    <DialogDescription>
                        {productName
                            ? `We'll notify you when "${productName}" is back in stock.`
                            : "We'll notify you when this product is back in stock."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "email" | "phone")}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="email" className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email
                            </TabsTrigger>
                            <TabsTrigger value="phone" className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Phone
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="email" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                                <p className="text-xs text-muted-foreground">
                                    We'll send you an email when this product is restocked.
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="phone" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+977 9800000000"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                                <p className="text-xs text-muted-foreground">
                                    We'll send you a WhatsApp message when this product is restocked.
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!isValid || isLoading}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                        >
                            {isLoading ? "Subscribing..." : "Notify Me"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
