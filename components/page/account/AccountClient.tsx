"use client";

import AddressesSection from "@/components/page/account/AddressesSection";
import NotificationsSection from "@/components/page/account/NotificationsSection";
import OrdersSection from "@/components/page/account/OrdersSection";
import PaymentMethodsSection from "@/components/page/account/PaymentMethodsSection";
import ProfileSection from "@/components/page/account/ProfileSection";
import SecuritySection from "@/components/page/account/SecuritySection";
import SettingsSection from "@/components/page/account/SettingsSection";
import SidebarNav from "@/components/page/account/SidebarNav";
import WishlistSection from "@/components/page/account/WishlistSection";
import { useAccount } from "@/hooks/account/useAccount";

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
      <SidebarNav
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="flex-1">{renderActiveSection()}</div>
    </>
  );
}
