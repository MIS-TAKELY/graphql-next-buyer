import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Bell,
    CreditCard,
    Heart,
    LogOut,
    MapPin,
    MessageCircle,
    Package,
    Settings,
    Shield,
    User,
} from "lucide-react";

export default function AccountLoading() {
    const sidebarItems = [
        { id: "profile", label: "Profile", icon: User },
        { id: "addresses", label: "Addresses", icon: MapPin },
        { id: "orders", label: "My Orders", icon: Package },
        { id: "wishlist", label: "Wishlist", icon: Heart },
        { id: "chat", label: "Messages", icon: MessageCircle },
        { id: "payment", label: "Payment Methods", icon: CreditCard },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "security", label: "Security", icon: Shield },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-muted/20">
            <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto px-4 py-8">
                {/* Static Sidebar with User Skeleton */}
                <div className="lg:w-64 w-full shrink-0">
                    <Card className="sticky top-20">
                        <CardHeader className="pb-4 hidden lg:block">
                            <div className="flex items-center space-x-4">
                                {/* User Avatar Skeleton */}
                                <div className="w-12 h-12 bg-secondary/20 rounded-full animate-pulse flex-shrink-0" />
                                <div className="min-w-0 flex-1 space-y-2">
                                    {/* User Name/Email Skeleton */}
                                    <div className="h-4 w-3/4 bg-secondary/20 rounded animate-pulse" />
                                    <div className="h-3 w-full bg-secondary/15 rounded animate-pulse" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-2 lg:pt-0">
                            <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible space-x-2 lg:space-x-0 lg:space-y-1 pb-2 lg:pb-0 scrollbar-hide">
                                {sidebarItems.map((item, index) => {
                                    const Icon = item.icon;
                                    // Make the first item (Profile) look somewhat active or just neutral
                                    const isActive = index === 0;
                                    return (
                                        <div
                                            key={item.id}
                                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-left whitespace-nowrap ${isActive
                                                    ? "bg-primary/10 text-primary" // Subtle active state for loading
                                                    : "text-muted-foreground"
                                                } w-auto lg:w-full`}
                                        >
                                            <Icon size={18} />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </div>
                                    );
                                })}
                                <Separator className="my-4 hidden lg:block" />
                                <div className="hidden lg:flex w-full items-center space-x-3 px-3 py-2 rounded-lg text-left text-red-600 opacity-50">
                                    <LogOut size={18} />
                                    <span className="text-sm font-medium">Sign Out</span>
                                </div>
                            </nav>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Skeleton */}
                <div className="flex-1 min-w-0 w-full space-y-6">
                    {/* Header Skeleton */}
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-secondary/20 rounded animate-pulse" />
                        <div className="h-4 w-64 bg-secondary/15 rounded animate-pulse" />
                    </div>

                    {/* Content Card Skeleton */}
                    <Card className="border-border/50">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 rounded-full bg-secondary/20 animate-pulse" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-6 w-48 bg-secondary/20 rounded animate-pulse" />
                                    <div className="h-4 w-64 bg-secondary/15 rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-4 w-24 bg-secondary/15 rounded animate-pulse" />
                                        <div className="h-10 bg-secondary/10 rounded animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
