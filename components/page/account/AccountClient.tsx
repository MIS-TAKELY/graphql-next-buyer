"use client";

import { useAccount } from "@/hooks/account/useAccount";
import SidebarNav from "@/components/page/account/SidebarNav";
import ProfileSection from "@/components/page/account/ProfileSection";
import AddressesSection from "@/components/page/account/AddressesSection";
import OrdersSection from "@/components/page/account/OrdersSection";
import WishlistSection from "@/components/page/account/WishlistSection";
import PaymentMethodsSection from "@/components/page/account/PaymentMethodsSection";
import NotificationsSection from "@/components/page/account/NotificationsSection";
import SecuritySection from "@/components/page/account/SecuritySection";
import SettingsSection from "@/components/page/account/SettingsSection";

export default function AccountClient({ user }: { user: any }) {
  const { activeTab, setActiveTab } = useAccount();

  const renderActiveSection = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSection />;
      case "addresses":
        return <AddressesSection />;
      case "orders":
        return <OrdersSection />;
      case "wishlist":
        return <WishlistSection />;
      case "payment":
        return <PaymentMethodsSection />;
      case "notifications":
        return <NotificationsSection />;
      case "security":
        return <SecuritySection />;
      case "settings":
        return <SettingsSection />;
      default:
        return null;
    }
  };

  return (
    <>
      <SidebarNav user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1">{renderActiveSection()}</div>
    </>
  );
}
