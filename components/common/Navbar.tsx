"use client";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Logo from "../navbar/Logo";
import SearchBar from "../navbar/SearchBar";
import UserDropdown from "../navbar/UserDropdown";
import SellerDialog from "../navbar/SellerDialog";
import CartButton from "../navbar/CartButton";
import MobileMenu from "../navbar/MobileMenu";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="glass sticky top-0 z-50 border-b border-border/40 transition-all duration-300">
      <div className="container-custom">
        {/* Main Navbar Row */}
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Search Bar - Hidden on mobile, shown on larger screens */}
          {/* Note: Original code showed SearchBar on all devices with flex-1. Preserving this but optimizing constraint. */}
          <div className="flex-1 max-w-2xl hidden md:block mx-4">
            <SearchBar isMobile={false} />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <SellerDialog />
            <div className="h-6 w-px bg-border/60 mx-2" />
            <UserDropdown />
            <CartButton />
          </div>

          {/* Mobile Actions (Search Trigger + Hamburger) */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile specific formatting could go here, e.g. search icon if bar is hidden */}
            <div className="sm:hidden w-8">
              {/* Placeholder for possibly collapsed search or keep search bar flexible if space permits */}
            </div>

            <CartButton />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-foreground hover:bg-secondary/80 hover:text-primary transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar Row (if strictly needed on very small screens separately) */}
        <div className="pb-3 md:hidden px-1">
          <SearchBar isMobile={true} />
        </div>

        {/* Mobile Dropdown Menu */}
        <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      </div>
    </nav>
  );
};

export default Navbar;