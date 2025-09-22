// ```typescript
"use client";

import { GET_PRODUCTS } from "@/client/product/product.queries";
import CartEmpty from "@/components/cart/CartEmpty";
import CartError from "@/components/cart/CartError";
import CartHeader from "@/components/cart/CartHeader";
import CartItem from "@/components/cart/CartItem";
import CartOrderSummary from "@/components/cart/CartOrderSummary";
import { useCart } from "@/hooks/cart/useCart";
import { useQuery } from "@apollo/client";
import { ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface VariantAttributes {
  comparePrice?: number;
}

interface CartVariant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  attributes: VariantAttributes;
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

export default function CartPage() {
  const [cartItems, setCartItems] = useState<ICartItem[]>([]);

  const {
    removeFromCart,
    myCartItems: cartProductIds,
    cartLoading,
  } = useCart();

  const {
    data: productdata,
    loading: productDataLoading,
    error: productDataError,
  } = useQuery(GET_PRODUCTS, { fetchPolicy: "cache-first" });

  const processedCartItems = useMemo((): ICartItem[] => {
    if (
      !cartProductIds ||
      !productdata?.getProducts ||
      cartLoading ||
      productDataLoading
    ) {
      return [];
    }

    const cartdata = productdata.getProducts.filter((product: Product) => {
      console.log("product-->", product);
      return cartProductIds.has(product.id);
    });

    return cartdata.map((product: Product, index: number) => {
      const variant = product.variants[0];
      const priceInCents = parseFloat(variant.price) * 100;
      const comparePrice = variant.comparePrice
        ? parseFloat(variant.comparePrice) * 100
        : undefined;

      return {
        id: product?.id || `cart-${index}`,
        quantity: 1, 
        createdAt: new Date(),
        variant: {
          id: variant.id,
          sku: variant.sku || `SKU-${product.id}`,
          price: priceInCents,
          stock: variant.stock || 10,
          attributes: { comparePrice },
        },
        product: {
          ...product,
          salePrice: priceInCents,
          returnPolicy: "30-day return policy",
          warranty: "1 Year Warranty",
        },
      };
    });
  }, [
    cartProductIds,
    productdata?.getProducts,
    cartLoading,
    productDataLoading,
  ]);

  useEffect(() => {
    if (cartItems.length === 0 && processedCartItems.length > 0) {
      setCartItems(processedCartItems);
    }
  }, [processedCartItems]);

  const updateQuantity = (cartId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === cartId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = async (productId: string, variantId: string) => {
    try {
      console.log("Removing item:", productId, variantId); // Debugging
      await removeFromCart(variantId, productId);
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.product.id !== productId)
      );
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

  if (productDataLoading || cartLoading) {
    return (
      <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
        <div className="text-center py-16">
          <ShoppingBag className="mx-auto h-24 w-24 text-gray-400 mb-4 animate-spin" />
          <h2 className="text-2xl font-bold mb-2">Loading cart...</h2>
        </div>
      </div>
    );
  }

  if (productDataError) {
    return <CartError />;
  }

  if (cartItems.length === 0) {
    return <CartEmpty />;
  }

  return (
    <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 lg:py-8">
      <CartHeader cartItems={cartItems} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              updateQuantity={updateQuantity}
              removeItem={removeItem}
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
