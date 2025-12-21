"use client";

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
import { usePathname, useRouter } from "next/navigation";

// Reusable SidebarNav component
// Props: user
// This can be reused in other dashboard-like pages
interface SidebarNavProps {
  user: { firstName?: string; lastName?: string; email?: string };
}

export default function SidebarNav({
  user,
}: SidebarNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const sidebarItems = [
    { id: "profile", label: "Profile", icon: User, href: "/account/profile" },
    { id: "addresses", label: "Addresses", icon: MapPin, href: "/account/addresses" },
    { id: "orders", label: "My Orders", icon: Package, href: "/account/orders" },
    { id: "wishlist", label: "Wishlist", icon: Heart, href: "/account/wishlist" },
    { id: "chat", label: "Messages", icon: MessageCircle, href: "/account/chat" }, // Added Chat
    { id: "payment", label: "Payment Methods", icon: CreditCard, href: "/account/payment" },
    { id: "notifications", label: "Notifications", icon: Bell, href: "/account/notifications" },
    { id: "security", label: "Security", icon: Shield, href: "/account/security" },
    { id: "settings", label: "Settings", icon: Settings, href: "/account/settings" },
  ];

  const handleNavigation = (item: any) => {
    router.push(item.href);
  };

  return (
    <div className="lg:w-64 w-full shrink-0">
      <Card className="sticky top-20">
        <CardHeader className="pb-4 hidden lg:block">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
              {user.firstName?.[0] || "U"}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 lg:pt-0">
          <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible space-x-2 lg:space-x-0 lg:space-y-1 pb-2 lg:pb-0 scrollbar-hide">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors whitespace-nowrap ${isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                    } ${isActive ? "w-auto lg:w-full" : "w-auto lg:w-full"}`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
            <Separator className="my-4 hidden lg:block" />
            <button className="hidden lg:flex w-full items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-muted text-red-600">
              <LogOut size={18} />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}
