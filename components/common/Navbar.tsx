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
      <div className="container">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Logo />
          {/* Search Bar - Desktop and Tablet */}
          <div className="hidden sm:block flex-1 max-w-3xl xl:max-w-4xl mx-4 lg:mx-8 xl:mx-12">
            <SearchBar />
          </div>
          {/* Right Side Icons - Desktop and Tablet */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <UserDropdown />
            <CartButton />
            <SellerDialog />
          </div>
          {/* Mobile and Small Tablet Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <CartButton isMobile />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-foreground hover:bg-secondary"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-muted-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
        {/* Mobile Menu */}
        <MobileMenu isOpen={mobileMenuOpen} />
      </div>
    </nav>
  );
};

export default Navbar;