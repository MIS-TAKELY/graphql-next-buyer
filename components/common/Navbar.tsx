"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/cart/useCart";
import { Menu, Search, ShoppingCart, User, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const searchSuggestions = [
  "phones",
  "laptops",
  "home decor",
  "fashion",
  "electronics",
  "books",
];

const Navbar = () => {
  // const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sellerForm, setSellerForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const { myCartItems } = useCart();

  const router = useRouter();

  const filteredSuggestions = searchSuggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isFormValid = sellerForm.name && sellerForm.email && sellerForm.phone;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(
        searchQuery.trim()
      )}`;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    window.location.href = `/search?q=${encodeURIComponent(suggestion)}`;
  };

  // const anonymousCart = JSON.parse(
  //   localStorage.getItem("anonymous_cart") || "[]"
  // );
  const cartCount = myCartItems?.size;
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img src="/ecommerce-logo.png" alt="Logo" className="h-8" />
            </div>
          </div>

          {/* Search Bar - Desktop and Tablet */}
          <div className="hidden sm:block flex-1 max-w-3xl xl:max-w-4xl mx-4 lg:mx-8 xl:mx-12 relative">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for products, brands and more"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  className="w-full pl-4 pr-12 text-sm md:text-base"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <Search className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                </button>
              </div>
            </form>
            {showSuggestions && searchQuery && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-10">
                {filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm md:text-base"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side Icons - Desktop and Tablet */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 lg:gap-2 text-sm lg:text-base"
                >
                  <User className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="hidden lg:inline">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {/* <DropdownMenuItem
                  onClick={() => {
                    router.push("/account");
                  }}
                >
                  My Account
                </DropdownMenuItem> */}
                <DropdownMenuItem>
                  <Link href={"/account"} prefetch={true}>My Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Orders</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              className="relative flex items-center gap-1 lg:gap-2 text-sm lg:text-base"
              onClick={() => {
                router.push("/cart");
              }}
            >
              <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="hidden lg:inline">Cart</span>
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -left-2 h-4 w-4 lg:h-5 lg:w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* Become a Seller */}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="text-sm lg:text-base px-2 lg:px-4">
                  <span className="hidden lg:inline">Become a Seller</span>
                  <span className="lg:hidden">Sell</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-4 max-w-md">
                <DialogHeader>
                  <DialogTitle>Seller Registration</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Full Name"
                    value={sellerForm.name}
                    onChange={(e) =>
                      setSellerForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={sellerForm.email}
                    onChange={(e) =>
                      setSellerForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    value={sellerForm.phone}
                    onChange={(e) =>
                      setSellerForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                  <Button className="w-full" disabled={!isFormValid}>
                    Submit Application
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Mobile and Small Tablet Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Cart Icon */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2"
              onClick={() => {
                router.push("/cart");
              }}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* Menu Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile and Small Tablet Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-4 pr-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 200)
                    }
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <Search className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                {/* Mobile Search Suggestions */}
                {showSuggestions && searchQuery && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-10">
                    {filteredSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </form>

              {/* Mobile Navigation Items */}
              <div className="space-y-3">
                {/* Account Section */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12"
                    >
                      <User className="w-5 h-5" />
                      My Account
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem>My Account</DropdownMenuItem>
                    <DropdownMenuItem>Orders</DropdownMenuItem>
                    <DropdownMenuItem>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Become a Seller */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full h-12" size="lg">
                      Become a Seller
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="mx-4 max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Seller Registration</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Full Name"
                        value={sellerForm.name}
                        onChange={(e) =>
                          setSellerForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                      <Input
                        type="email"
                        placeholder="Email Address"
                        value={sellerForm.email}
                        onChange={(e) =>
                          setSellerForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                      />
                      <Input
                        type="tel"
                        placeholder="Phone Number"
                        value={sellerForm.phone}
                        onChange={(e) =>
                          setSellerForm((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                      />
                      <Button className="w-full" disabled={!isFormValid}>
                        Submit Application
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
