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
    <nav className="bg-card sticky top-0 z-50">
      <div className="px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Main Navbar Row */}
        <div className="flex items-center justify-between h-12 xs:h-14 sm:h-16 md:h-18 gap-2">
          {/* Logo */}
          <Logo />
          
          {/* Search Bar - All devices */}
          <div className="flex-1 max-w-[600px] md:max-w-[700px] lg:max-w-[800px] xl:max-w-[1000px]">
            <SearchBar isMobile={true} />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <UserDropdown />
            <CartButton />
            <SellerDialog />
          </div>
          
          {/* Mobile Hamburger Menu */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-foreground hover:bg-secondary"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-muted-foreground" />
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