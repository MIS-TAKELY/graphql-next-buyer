"use client";
import { Button } from "@/components/ui/button";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import Logo from "../navbar/Logo";
import SearchBar from "../navbar/SearchBar";
import UserDropdown from "../navbar/UserDropdown";
import SellerDialog from "../navbar/SellerDialog";
import CartButton from "../navbar/CartButton";
import MobileMenu from "../navbar/MobileMenu";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <nav className="glass sticky top-0 z-50 border-b border-border/40 transition-all duration-300">
      <div className="container-custom">
        {/* Single Line Navbar - Amazon/Flipkart Style */}
        <div className="flex items-center justify-between h-12 sm:h-14 md:h-16 gap-2 sm:gap-4">
          {/* Logo - Compact on mobile */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Search Bar - Hidden on mobile, shown on md+ */}
          <div className="flex-1 max-w-2xl hidden md:block mx-4">
            <SearchBar isMobile={false} />
          </div>

          {/* Actions - All in one row */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden h-9 w-9 text-foreground hover:bg-secondary/80"
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2 lg:gap-4">
              <SellerDialog />
              <div className="h-5 w-px bg-border/60" />
              <UserDropdown />
            </div>

            {/* Cart - Always visible */}
            <CartButton />

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden h-9 w-9 text-foreground hover:bg-secondary/80"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Expandable Mobile Search - Only shows when toggled */}
        {mobileSearchOpen && (
          <div className="pb-2 md:hidden animate-fade-in">
            <SearchBar isMobile={true} />
          </div>
        )}

        {/* Mobile Dropdown Menu */}
        <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      </div>
    </nav>
  );
};

export default Navbar;