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

const UserDropdown = ({ isMobile = false }: UserDropdownProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        className={`flex items-center gap-1 lg:gap-2 text-sm lg:text-base text-foreground hover:bg-secondary ${
          isMobile ? "w-full justify-start gap-3 h-12" : ""
        }`}
      >
        <User className="w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />
        <span className={isMobile ? "" : "hidden lg:inline"}>Account</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="bg-popover border-border w-full">
      <DropdownMenuItem className="text-popover-foreground hover:bg-accent focus:bg-accent">
        <Link href="/account" prefetch={true}>
          My Account
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem className="text-popover-foreground hover:bg-accent focus:bg-accent">
        <Link href="/orders" prefetch={true}>
          Orders
        </Link>
      </DropdownMenuItem>
      <SignOutButton>
        <DropdownMenuItem className="text-popover-foreground hover:bg-accent focus:bg-accent">
          Logout
        </DropdownMenuItem>
      </SignOutButton>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default UserDropdown;
