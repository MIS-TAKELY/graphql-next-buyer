import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  CreditCard,
  Heart,
  LogOut,
  MapPin,
  Package,
  Settings,
  Shield,
  User,
} from "lucide-react";

// Reusable SidebarNav component
// Props: user, activeTab, setActiveTab
// This can be reused in other dashboard-like pages
interface SidebarNavProps {
  user: { firstName?: string; lastName?: string; email?: string };
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function SidebarNav({
  user,
  activeTab,
  setActiveTab,
}: SidebarNavProps) {
  const sidebarItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "payment", label: "Payment Methods", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="lg:w-64 w-full">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
              {user.firstName?.[0] || "U"}
            </div>
            <div>
              <p className="font-medium">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
            <Separator className="my-4" />
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-muted text-red-600">
              <LogOut size={18} />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}
