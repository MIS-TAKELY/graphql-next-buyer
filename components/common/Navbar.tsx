// components/Navbar.tsx
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
import { SignOutButton } from "@clerk/nextjs";
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

  const cartCount = myCartItems?.size;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-600">
      <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                src="/sitelogo.svg"
                alt="Logo"
                className="h-8 filter dark:invert hover:cursor-pointer"
                onClick={() => router.push("/")}
              />
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
                  className="w-full pl-10 pr-12 text-sm md:text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <Search className="w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-300" />
                </button>
              </div>
            </form>
            {showSuggestions && searchQuery && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg mt-1 z-10">
                {filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm md:text-base text-gray-900 dark:text-white"
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
                  className="flex items-center gap-1 lg:gap-2 text-sm lg:text-base text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <User className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600 dark:text-gray-300" />
                  <span className="hidden lg:inline">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                <DropdownMenuItem className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Link href="/account" prefetch={true}>
                    My Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Link href="/orders" prefetch={true}>
                    Orders
                  </Link>
                </DropdownMenuItem>
                <SignOutButton>
                  <DropdownMenuItem className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                    Logout
                  </DropdownMenuItem>
                </SignOutButton>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              className="relative flex items-center gap-1 lg:gap-2 text-sm lg:text-base text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                router.push("/cart");
              }}
            >
              <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600 dark:text-gray-300" />
              <span className="hidden lg:inline">Cart</span>
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -left-2 h-4 w-4 lg:h-5 lg:w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 dark:bg-red-600 text-white">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* Become a Seller */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="text-sm lg:text-base px-2 lg:px-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600"
                >
                  <span className="hidden lg:inline">Become a Seller</span>
                  <span className="lg:hidden">Sell</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-4 max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-white">
                    Seller Registration
                  </DialogTitle>
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
                    className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500"
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
                    className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500"
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
                    className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <Button
                    className="w-full bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-400"
                    disabled={!isFormValid}
                  >
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
              className="relative p-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                router.push("/cart");
              }}
            >
              <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 dark:bg-red-600 text-white">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* Menu Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile and Small Tablet Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 dark:border-gray-600 py-4 bg-white dark:bg-gray-800">
            <div className="space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-12 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500 dark:focus:ring-blue-400"
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
                    <Search className="w-5 h-5 text-gray-400 dark:text-gray-300" />
                  </button>
                </div>
                {/* Mobile Search Suggestions */}
                {showSuggestions && searchQuery && (
                  <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg mt-1 z-10">
                    {filteredSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-white"
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
                      className="w-full justify-start gap-3 h-12 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      My Account
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                    <DropdownMenuItem className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Link href="/account" prefetch={true}>
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Link href="/orders" prefetch={true}>
                        Orders
                      </Link>
                    </DropdownMenuItem>
                    <SignOutButton>
                      <DropdownMenuItem className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                        Logout
                      </DropdownMenuItem>
                    </SignOutButton>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Become a Seller */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600"
                      size="lg"
                    >
                      Become a Seller
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="mx-4 max-w-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900 dark:text-white">
                        Seller Registration
                      </DialogTitle>
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
                        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500"
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
                        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500"
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
                        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500"
                      />
                      <Button
                        className="w-full bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-400"
                        disabled={!isFormValid}
                      >
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
