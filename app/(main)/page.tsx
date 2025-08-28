"use client";

import { GET_CART_PRODUCT_IDS } from "@/client/cart/cart.queries";
import { GET_PRODUCTS } from "@/client/product/product.queries";
import HeroCarousel from "@/components/page/home/HeroCarousel";
import { IProduct } from "@/components/page/home/ProductCard";
import ProductCatagoryCardSection from "@/components/page/home/ProductCatagoryCardSection";
import ProductSection from "@/components/page/home/ProductSection";
import { useQuery } from "@apollo/client";
import { memo, useMemo } from "react";

// Create a context to avoid prop drilling and provide cart data to all components
import React, { createContext, useContext } from "react";

interface CartContextType {
  cartItems: Set<string>;
  loading: boolean;
}

const CartContext = createContext<CartContextType>({
  cartItems: new Set(),
  loading: false,
});

export const useCart = () => useContext(CartContext);

// Memoized section divider component
const SectionContainer = memo(({ children }: { children: React.ReactNode }) => (
  <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 lg:py-8">
    {children}
  </div>
));

SectionContainer.displayName = "SectionContainer";

function HomePage() {
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useQuery(GET_PRODUCTS, {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
    notifyOnNetworkStatusChange: false,
  });

  const { data: myCartItems, loading: cartLoading } = useQuery(
    GET_CART_PRODUCT_IDS,
    {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
      notifyOnNetworkStatusChange: false,
    }
  );

  if (process.env.NODE_ENV === "development" && productsError) {
    console.error("Products query error:", productsError);
  }

  // Memoize cart product IDs to prevent recreation on each render
  const cartProductIds = useMemo<Set<string>>(() => {
    if (!myCartItems?.getMyCart) return new Set<string>();
    return new Set<string>(
      myCartItems.getMyCart.map((item: any) => item.variant.product.id)
    );
  }, [myCartItems?.getMyCart]);

  // Memoize sliced product arrays with better algorithm
  const productSections = useMemo(() => {
    if (!productsData?.getProducts) return null;

    const products = productsData.getProducts as IProduct[];

    // Use array references instead of slicing for better performance
    return {
      bestDeals: products.slice(0, 8),
      topOffers: products.slice(8, 14), // Different products for variety
      recommended: products.slice(14, 20), // Different products for variety
    };
  }, [productsData?.getProducts]);

  // Memoize cart context value
  const cartContextValue = useMemo(
    () => ({
      cartItems: cartProductIds,
      loading: cartLoading,
    }),
    [cartProductIds, cartLoading]
  );

  if (productsError && !productsData) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Unable to load products
          </h2>
          <p className="text-gray-600">
            Please refresh the page or try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <CartContext.Provider value={cartContextValue}>
      <div className="bg-gray-50">
        <ProductCatagoryCardSection />
        <HeroCarousel />

        <SectionContainer>
          <ProductSection
            name="Today's Best Deals"
            products={productSections?.bestDeals}
            loading={productsLoading}
            count={8}
            layout="horizontal"
          />

          <ProductSection
            name="Top Offers"
            products={productSections?.topOffers}
            loading={productsLoading}
            count={6}
            layout="grid"
          />

          <ProductSection
            name="Recommended For You"
            products={productSections?.recommended}
            loading={productsLoading}
            count={6}
            layout="grid"
          />
        </SectionContainer>
      </div>
    </CartContext.Provider>
  );
}

export default memo(HomePage);
