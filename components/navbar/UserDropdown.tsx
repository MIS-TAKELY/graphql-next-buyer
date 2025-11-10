import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutButton } from "@clerk/nextjs";
import { User } from "lucide-react";
import Link from "next/link";

interface UserDropdownProps {
  isMobile?: boolean;
}

const UserDropdown = ({ isMobile = false }: UserDropdownProps) => {
  if (isMobile) {
    return (
      <div className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-12 text-foreground hover:bg-secondary"
          asChild
        >
          <Link href="/account">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>My Account</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-12 text-foreground hover:bg-secondary"
          asChild
        >
          <Link href="/orders">
            <span className="ml-7">Orders</span>
          </Link>
        </Button>
        <SignOutButton>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 text-foreground hover:bg-secondary"
          >
            <span className="ml-7">Logout</span>
          </Button>
        </SignOutButton>
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
          <span className="hidden lg:inline">Account</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-popover border-border">
        <DropdownMenuItem className="text-popover-foreground hover:bg-accent focus:bg-accent">
          <Link href="/account">My Account</Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-popover-foreground hover:bg-accent focus:bg-accent">
          <Link href="/orders">Orders</Link>
        </DropdownMenuItem>
        <SignOutButton>
          <DropdownMenuItem className="text-popover-foreground hover:bg-accent focus:bg-accent">
            Logout
          </DropdownMenuItem>
        </SignOutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;