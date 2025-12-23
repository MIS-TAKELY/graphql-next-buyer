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

interface UserDropdownProps {
  isMobile?: boolean;
  onItemClick?: () => void;
}

const UserDropdown = ({ isMobile = false, onItemClick }: UserDropdownProps) => {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
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
      <div className="space-y-0.5">
        {/* Account Section Header */}
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Account
        </div>

        {/* My Account */}
        <Link href="/account/profile" className="block" onClick={onItemClick}>
          <div className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-secondary/80 active:bg-secondary transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">My Account</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </Link>

        {/* Orders */}
        <Link href="/account/orders" className="block" onClick={onItemClick}>
          <div className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-secondary/80 active:bg-secondary transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">Orders</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </Link>

        {/* Logout */}
        <button className="w-full text-left" onClick={handleSignOut}>
          <div className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-secondary/80 active:bg-secondary transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center">
                <LogOut className="w-4 h-4 text-destructive" />
              </div>
              <span className="text-sm font-medium text-foreground">Logout</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </button>
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
          <User className="w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />
          <span className="hidden lg:inline">{session.user.name || "Account"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-popover border-border">
        <DropdownMenuItem className="text-popover-foreground hover:bg-accent focus:bg-accent" asChild>
          <Link href="/account/profile">My Account</Link>
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