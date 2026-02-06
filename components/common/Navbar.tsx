
// Navbar.tsx (updated)
"use client";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import Logo from "../navbar/Logo";
import SearchBar from "../navbar/SearchBar";
import UserDropdown from "../navbar/UserDropdown";
import SellerDialog from "../navbar/SellerDialog";
import CartButton from "../navbar/CartButton";
import MobileMenu from "../navbar/MobileMenu";
import { ModeToggle } from "../ui/mode-toggle";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when screen becomes desktop size
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <nav className="glass sticky top-0 z-50 border-b border-border/40 transition-all duration-300">
      <div className="container-custom">
        {/* Single Line Navbar - Amazon/Flipkart Style */}
        <div className="flex items-center justify-between h-12 sm:h-14 md:h-16 gap-2 sm:gap-4">
          {/* Logo - Compact on mobile */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Search Bar - Always visible */}
          <div className="flex-1 max-w-2xl mx-2 sm:mx-4">
            <SearchBar isMobile={false} />
          </div>

          {/* Actions - All in one row */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2 lg:gap-4">
              <SellerDialog />
              <div className="h-5 w-px bg-border/60" />
              <UserDropdown />
              <ModeToggle />
            </div>

            {/* Cart - Always visible */}
            <CartButton />

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden h-9 w-9 text-foreground hover:bg-secondary/80 transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      </div>
    </nav>
  );
};

export default Navbar;