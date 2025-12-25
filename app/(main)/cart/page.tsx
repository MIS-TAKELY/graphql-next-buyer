// app/(main)/cart/page.tsx
"use client";

import { GET_MY_CART_ITEMS } from "@/client/cart/cart.queries";
import { GET_PRODUCTS_MINIMAL } from "@/client/product/product.queries";
import CartEmpty from "@/components/cart/CartEmpty";
import CartError from "@/components/cart/CartError";
import CartHeader from "@/components/cart/CartHeader";
import CartItem from "@/components/cart/CartItem";
import CartOrderSummary from "@/components/cart/CartOrderSummary";
import { useCart } from "@/hooks/cart/useCart";
import { useQuery } from "@apollo/client";
import { useSession } from "@/lib/auth-client";
import { ShoppingBag } from "lucide-react";
import { useMemo } from "react";

interface VariantAttributes {
  comparePrice?: number;
}

interface CartVariant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  attributes: VariantAttributes;
  product: Product;
}

interface CartProduct {
  id: string;
  name: string;
  description?: string;
  salePrice: number;
  returnPolicy: string;
  warranty: string;
  slug: string;
  images: ProductImage[];
  [key: string]: any;
}

export interface ICartItem {
  id: string;
  quantity: number;
  createdAt: Date;
  variant: CartVariant;
  product: CartProduct;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
}

export interface ProductReview {
  id?: string;
  rating?: number;
  comment?: string;
  [key: string]: any;
}

export interface ProductVariant {
  id: string;
  price: string;
  comparePrice?: string;
  sku?: string;
  stock?: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  slug: string;
  status: string;
  images: ProductImage[];
  reviews: ProductReview[];
  variants: ProductVariant[];
}

// Define a new interface for the simplified cart item data
interface CartItemData {
  id: string;
  name: string;
  image: string;
  price: string;
  variantId: string;
  quantity: number;
}

export default function CartPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const {
    removeFromCart,
    updateQuantity,
    myCartItems: cartProductIds,
    cartLoading,
    anonymousCart,
  } = useCart();

  // Fetch products for logged-in user
  const { data: cartData, loading: cartDataLoading, error: cartDataError } = useQuery(GET_MY_CART_ITEMS, {
    skip: !userId || !cartProductIds || cartProductIds.size === 0,
    fetchPolicy: "cache-first",
  });

  // Fetch all products for guest user (to find details for anonymous cart items)
  // Optimization: In a real app, we'd have a getProductsByIds query
  const { data: allProductsData, loading: allProductsLoading } = useQuery(GET_PRODUCTS_MINIMAL, {
    skip: !!userId || !anonymousCart || anonymousCart.length === 0,
    fetchPolicy: "cache-first",
  });

  const cartItems = useMemo((): ICartItem[] => {
    if (userId) {
      if (!cartData?.getMyCart) return [];

      return cartData.getMyCart.map((item: any) => {
        const variant = item.variant;
        const priceInCents = parseFloat(variant.price);
        const comparePrice = variant.mrp ? parseFloat(variant.mrp) : undefined;

        return {
          id: item.id,
          quantity: item.quantity,
          createdAt: new Date(),
          variant: {
            id: variant.id,
            sku: variant.sku || `SKU-${variant.product.id}`,
            price: priceInCents,
            stock: variant.stock || 10,
            attributes: { comparePrice },
            product: {
              ...variant.product,
              status: "ACTIVE",
              variants: [],
              reviews: []
            }
          },
          product: {
            ...variant.product,
            salePrice: priceInCents,
            returnPolicy: "30-day return policy",
            warranty: "1 Year Warranty",
            status: "ACTIVE",
            variants: [],
            reviews: []
          },
        };
      });
    } else {
      // Guest User: Map anonymousCart to product details
      if (!anonymousCart || !allProductsData?.getProducts) return [];

      return anonymousCart.map((cartItem) => {
        const product = allProductsData.getProducts.find((p: any) => p.id === cartItem.variant.product.id);
        if (!product) return null;

        // Use default variant or first variant
        const variant = product.variants?.find((v: any) => v.isDefault) || product.variants?.[0];
        if (!variant) return null;

        const priceInCents = parseFloat(variant.price);
        const comparePrice = variant.mrp ? parseFloat(variant.mrp) : undefined;

        const cartItemResult: ICartItem = {
          id: `guest-${product.id}`,
          quantity: cartItem.quantity || 1,
          createdAt: new Date(),
          variant: {
            id: variant.id,
            sku: variant.sku || `SKU-${product.id}`,
            price: priceInCents,
            stock: variant.stock || 10,
            attributes: { comparePrice },
            product: {
              ...product,
              status: "ACTIVE",
              variants: [],
              reviews: []
            }
          },
          product: {
            ...product,
            salePrice: priceInCents,
            returnPolicy: "30-day return policy",
            warranty: "1 Year Warranty",
            status: "ACTIVE",
            variants: [],
            reviews: []
          },
        };
        return cartItemResult;
      }).filter((item): item is ICartItem => item !== null);
    }
  }, [cartData, userId, anonymousCart, allProductsData]);

  // Handle quantity update - calls mutation
  // Note: cartId passed here is actually the variantId from CartItem component
  const handleUpdateQuantity = async (cartId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateQuantity(cartId, newQuantity);
  };

  // Handle remove item
  const handleRemoveItem = async (productId: string, variantId: string) => {
    try {
      await removeFromCart(variantId, productId);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const { subtotal, originalTotal, totalSavings } = useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.variant.price * item.quantity,
      0
    );
    const originalTotal = cartItems.reduce((sum, item) => {
      const comparePrice =
        item.variant.attributes?.comparePrice || item.variant.price;
      return sum + comparePrice * item.quantity;
    }, 0);
    const totalSavings = originalTotal - subtotal;

    return { subtotal, originalTotal, totalSavings };
  }, [cartItems]);

  if (cartDataLoading || cartLoading) {
    return (
      <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 bg-gray-50 dark:bg-gray-900">
        <div className="text-center py-16">
          <ShoppingBag className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-500 mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Loading cart...
          </h2>
        </div>
      </div>
    );
  }

  if (cartDataError) {
    return <CartError />;
  }

  if (cartItems.length === 0) {
    return <CartEmpty />;
  }

  return (
    <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 lg:py-8 bg-gray-50 dark:bg-gray-900">
      <CartHeader cartItems={cartItems} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              updateQuantity={handleUpdateQuantity}
              removeItem={handleRemoveItem}
            />
          ))}
        </div>
        <CartOrderSummary
          cartItems={cartItems}
          subtotal={subtotal}
          originalTotal={originalTotal}
          totalSavings={totalSavings}
        />
      </div>
    </div>
  );
}
