import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";
import { User, Package, LogOut, ChevronRight, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_ALL_CONVERSATIONS } from "@/client/conversatation/conversatation.query";
import { useNotificationStore } from "@/store/notificationStore";
import { GET_MY_ORDER_ITEMS } from "@/client/order/order.queries";
import { useEffect } from "react";

interface UserDropdownProps {
  isMobile?: boolean;
  onItemClick?: () => void;
}

const UserDropdown = ({ isMobile = false, onItemClick }: UserDropdownProps) => {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const { data: conversationsData } = useQuery(GET_ALL_CONVERSATIONS, {
    skip: !session,
    fetchPolicy: "network-only",
  });

  const totalUnread = conversationsData?.conversations?.reduce(
    (acc: number, conv: any) => acc + (conv.unreadCount || 0),
    0
  ) || 0;

  const { hasNewOrderUpdate, lastSeenOrderUpdate, setHasNewOrderUpdate } = useNotificationStore();

  const { data: ordersData } = useQuery(GET_MY_ORDER_ITEMS, {
    variables: { limit: 10, offset: 0 },
    skip: !session,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (ordersData?.getMyOrderItems) {
      const latestOrderUpdate = ordersData.getMyOrderItems.reduce((latest: string, order: any) => {
        return !latest || new Date(order.updatedAt) > new Date(latest) ? order.updatedAt : latest;
      }, "");

      if (latestOrderUpdate && (!lastSeenOrderUpdate || new Date(latestOrderUpdate) > new Date(lastSeenOrderUpdate))) {
        setHasNewOrderUpdate(true);
      }
    }
  }, [ordersData, lastSeenOrderUpdate, setHasNewOrderUpdate]);

  const hasAnyNotification = totalUnread > 0 || hasNewOrderUpdate;

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
    if (onItemClick) onItemClick();
  };

  const handleSignIn = () => {
    router.push("/sign-in");
    if (onItemClick) onItemClick();
  }

  if (isPending) {
    return (
      <div className={`animate-pulse bg-muted rounded-full ${isMobile ? "w-full h-12" : "w-10 h-10"}`} />
    )
  }

  if (!session) {
    if (isMobile) {
      return (
        <Button
          variant="default"
          className="w-full justify-start h-12 text-base font-medium"
          onClick={handleSignIn}
        >
          <LogIn className="w-5 h-5 mr-3" />
          Sign In
        </Button>
      )
    }

    return (
      <Button
        variant="default"
        size="sm"
        onClick={handleSignIn}
        className="flex items-center gap-2"
      >
        <User className="w-4 h-4" />
        <span className="hidden lg:inline">Sign In</span>
      </Button>
    )
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Account Section Header */}
        <div className="px-1 text-xs font-bold text-muted-foreground uppercase tracking-[0.1em]">
          Account settings
        </div>

        <div className="grid gap-2">
          {/* My Account */}
          <Link
            href="/account/profile"
            className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 active:scale-[0.98] transition-all group border border-border/50"
            onClick={onItemClick}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center relative">
                <User className="w-5 h-5 text-primary" />
                {hasAnyNotification && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 rounded-full border-2 border-background animate-in zoom-in duration-300" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold text-foreground">My Profile</span>
                <span className="text-xs text-muted-foreground">Manage your personal info</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
          </Link>

          {/* Orders */}
          <Link
            href="/account/orders"
            className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 active:scale-[0.98] transition-all group border border-border/50"
            onClick={onItemClick}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold text-foreground">My Orders</span>
                <span className="text-xs text-muted-foreground">Check your order history</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
          </Link>

          {/* Logout */}
          <button
            className="flex items-center justify-between p-4 rounded-xl bg-destructive/5 hover:bg-destructive/10 active:scale-[0.98] transition-all group border border-destructive/10"
            onClick={handleSignOut}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[15px] font-semibold text-destructive">Logout</span>
                <span className="text-xs text-destructive/70">Sign out of your account</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-destructive/30 group-hover:text-destructive transition-colors" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-1 lg:gap-2 text-sm lg:text-base text-foreground hover:bg-secondary"
        >
          <div className="relative">
            <User className="w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />
            {hasAnyNotification && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-background animate-in zoom-in duration-300" />
            )}
          </div>
          <span className="hidden lg:inline">{session.user.name || "Account"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-popover border-border">
        <DropdownMenuItem className="text-popover-foreground hover:bg-accent focus:bg-accent flex items-center justify-between" asChild>
          <Link href="/account/profile">
            <span>My Account</span>
            {hasAnyNotification && (
              <span className="w-2 h-2 bg-red-600 rounded-full ml-2" />
            )}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-popover-foreground hover:bg-accent focus:bg-accent" asChild>
          <Link href="/account/orders">Orders</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-popover-foreground hover:bg-accent focus:bg-accent cursor-pointer"
          onClick={handleSignOut}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;