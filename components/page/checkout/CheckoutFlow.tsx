"use client";

import { GET_ADDRESS_OF_USER } from "@/client/address/address.queries";
import { VERIFY_ESEWA_PAYMENT } from "@/client/payment/payment.mutations";
import { GET_PRODUCT_BY_SLUG } from "@/client/product/product.queries";
import { AddressStep } from "@/components/page/buy-now/AddressStep";
import { BuyNowHeader } from "@/components/page/buy-now/BuyNowHeader";
import { BuyNowSteps } from "@/components/page/buy-now/BuyNowSteps";
import { PaymentStep } from "@/components/page/buy-now/PaymentStep";
import { OrderSummary } from "@/components/page/checkout/OrderSummary";
import { useBuyNow } from "@/hooks/buy-now/useBuyNow";
import { useCart } from "@/hooks/cart/useCart";
import { formatPrice } from "@/lib/utils";
import { CartItem } from "@/store/cartStore";
import { useMutation, useQuery } from "@apollo/client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useAuthModal } from "@/store/authModalStore";

interface CheckoutFlowProps {
    isCartOverride?: boolean;
}

export function CheckoutFlow({ isCartOverride = false }: CheckoutFlowProps) {
    // Sync visual step with logical step
    const [currentStep, setCurrentStep] = useState(1);
    const searchParams = useSearchParams();
    const router = useRouter(); // Added router
    const { data: session, isPending: isSessionLoading } = useSession(); // Added session check
    const { openModal } = useAuthModal(); // Added auth modal

    const productSlug = searchParams.get("product");
    const quantity = parseInt(searchParams.get("quantity") || "1");
    const variantId = searchParams.get("variant");

    // Determine mode: Explicit prop OR query param
    const isFromCart = isCartOverride || searchParams.get("from") === "cart";

    // eSewa callback parameters
    const isCallback = searchParams.get("callback") === "true";
    const callbackPid = searchParams.get("pid");
    const callbackOrderId = searchParams.get("orderId");
    const callbackRefId = searchParams.get("refId");
    const callbackAmt = searchParams.get("amt");

    const {
        step,
        selectedAddress,
        setSelectedAddress,
        showAddressForm,
        selectedPaymentMethod,
        isProcessingPayment,
        handleAddressSaved,
        handleAddressCancel,
        handleUseDefaultAddress,
        handleSelectAddress,
        handlePaymentMethodSelect,
        handlePaymentSubmit,
        handleInitiateFonepay,
        handleBackToAddress,
    } = useBuyNow();

    // EFFECT: Sync the visual `currentStep` with the logical `step` from useBuyNow
    useEffect(() => {
        switch (step) {
            case "address":
                setCurrentStep(1);
                break;
            case "payment":
                setCurrentStep(2);
                break;
            case "summary":
                setCurrentStep(3);
                break;
            default:
                setCurrentStep(1);
        }
    }, [step]);

    // NEW: Check for session on mount / update
    useEffect(() => {
        if (!isSessionLoading) {
            if (!session?.user) {
                openModal("SIGN_IN");
            } else {
                const user = session.user as any;
                if (!user.phoneNumberVerified || !user.emailVerified) {
                    // Open modal to trigger verification flow in UnifiedAuth
                    openModal("SIGN_UP_WHATSAPP_INPUT");
                }
            }
        }
    }, [isSessionLoading, session, openModal]);

    const [verifyEsewaPayment] = useMutation(VERIFY_ESEWA_PAYMENT);

    // Use global cart hook
    const { cartItems, selectedItems, loading: cartLoading } = useCart();

    // Existing product query (skip if from cart)
    const { data: productData, loading: productLoading } = useQuery(
        GET_PRODUCT_BY_SLUG,
        {
            variables: { slug: productSlug },
            skip: isFromCart, // Skip if from cart
            fetchPolicy: "cache-first",
            errorPolicy: "all",
        }
    );

    // Existing address query
    const { data: addressData, loading: addressLoading } =
        useQuery(GET_ADDRESS_OF_USER);

    const product = productData?.getProductBySlug;
    const addresses = addressData?.getAddressOfUser || [];

    // UPDATED: Calculate order amount (handle both single product and cart)
    // UPDATED: Calculate order amount (handle both single product and cart)
    const calculateOrderAmount = () => {
        if (isFromCart) {
            if (!selectedItems.length) return { subtotal: 0, shipping: 0, tax: 0, total: 0 };
            const subtotal = selectedItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );
            // Sum delivery charges for all unique products in the cart
            const shipping = selectedItems.reduce(
                (sum, item) => sum + (Number(item.deliveryCharge) || 0),
                0
            );
            const tax = 0;
            return { subtotal, shipping, tax, total: subtotal + shipping + tax };
        }
        if (!product || !product.variants) return { subtotal: 0, shipping: 0, tax: 0, total: 0 };

        // Use selected variant if available, otherwise default
        const selectedVariant = variantId
            ? product.variants.find((v: any) => v.id === variantId)
            : (product.variants.find((v: any) => v.isDefault) || product.variants[0]);

        if (!selectedVariant) return { subtotal: 0, shipping: 0, tax: 0, total: 0 };
        const subtotal = selectedVariant.price * quantity;
        const shipping = Number(product.deliveryCharge) || 0;
        const tax = 0;
        return { subtotal, shipping, tax, total: subtotal + shipping + tax };
    };

    const { subtotal, shipping, tax, total: orderAmount } = calculateOrderAmount();

    // UPDATED: Map cart items to OrderItem[] for OrderSummary (if from cart)
    const selectedVariant = !isFromCart && product?.variants
        ? (variantId
            ? product.variants.find((v: any) => v.id === variantId)
            : (product.variants.find((v: any) => v.isDefault) || product.variants[0]))
        : null;

    // Items for Summary AND for Payment Submission
    const orderItemsForSummary = isFromCart
        ? selectedItems.map((cartItem: CartItem) => ({
            id: cartItem.id,
            quantity: cartItem.quantity,
            price: cartItem.price * cartItem.quantity, // Subtotal per item
            variant: {
                id: cartItem.variantId,
                price: cartItem.price,
                attributes: { comparePrice: cartItem.comparePrice },
                product: {
                    name: cartItem.name,
                    images: cartItem.image ? [{ url: cartItem.image }] : [],
                },
            },
        }))
        : [
            // Fallback to single product (existing logic)
            {
                id: product?.id || "",
                quantity,
                price: selectedVariant?.price || 0,
                variant: {
                    id: selectedVariant?.id || "1",
                    price: selectedVariant?.price || 0,
                    attributes: selectedVariant?.attributes,
                    product: {
                        name: product?.name || "",
                        images: product?.images || [],
                    },
                },
            },
        ];

    // NEW: Cart-specific totals (adapt from CartOrderSummary logic)
    const cartSubtotal =
        selectedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

    // Handle eSewa callback (unchanged)
    useEffect(() => {
        if (
            isCallback &&
            callbackPid &&
            callbackOrderId &&
            callbackRefId &&
            callbackAmt
        ) {
            const verifyPayment = async () => {
                try {
                    await verifyEsewaPayment({
                        variables: {
                            input: {
                                orderId: callbackOrderId,
                                refId: callbackRefId,
                                amount: parseFloat(callbackAmt),
                            },
                        },
                    });
                    setCurrentStep(3);
                } catch (error) {
                    console.error("Failed to verify eSewa payment:", error);
                }
            };
            verifyPayment();
        }
    }, [
        isCallback,
        callbackPid,
        callbackOrderId,
        callbackRefId,
        callbackAmt,
        verifyEsewaPayment,
    ]);

    useEffect(() => {
        if (addresses.length > 0) {
            const defaultAddress = addresses.find((addr: any) => addr.isDefault);
            if (defaultAddress) {
                setSelectedAddress(defaultAddress);
            }
        }
    }, [addresses, setSelectedAddress]);

    // Show error if callback failed (unchanged)
    if (searchParams.get("error")) {
        return (
            <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900">
                <div className="text-center text-red-600 dark:text-red-400">
                    Payment callback failed. Please try again.
                </div>
            </div>
        );
    }

    // UPDATED: BuyNowHeader (pass cart info if needed; assume it handles empty slug)
    const headerProductName = isFromCart
        ? `Cart (${selectedItems.length} items)`
        : product?.name;

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900">
            <BuyNowHeader
                productSlug={productSlug || ""}
                productName={headerProductName}
                title={isFromCart ? "Checkout" : "Buy Now"}
            />
            <BuyNowSteps currentStep={currentStep} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT SIDE: Address & Payment */}
                <div className="lg:col-span-2 space-y-6">
                    {/* 
            CRITICAL FIX: 
            Wait for BOTH address loading AND (product loading OR cart loading) 
            before showing the address step. This prevents the user from selecting 
            an address and trying to move to payment before we have the product data 
            needed to calculate totals/render PaymentStep.
          */}
                    {addressLoading || (isFromCart ? cartLoading : productLoading) ? (
                        <div className="space-y-4">
                            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                    ) : (
                        step === "address" && (
                            <AddressStep
                                selectedAddress={selectedAddress}
                                showAddressForm={showAddressForm}
                                addresses={addresses}
                                onAddressSaved={handleAddressSaved}
                                onCancelAddressForm={handleAddressCancel}
                                onUseDefaultAddress={handleUseDefaultAddress}
                                onSelectAddress={handleSelectAddress}
                            />
                        )
                    )}

                    {step === "payment" && (
                        <PaymentStep
                            selectedAddress={selectedAddress}
                            selectedPaymentMethod={selectedPaymentMethod}
                            orderAmount={orderAmount}
                            isProcessingPayment={isProcessingPayment}
                            onPaymentMethodSelect={handlePaymentMethodSelect}
                            onPaymentSubmit={(paymentData: any) => {
                                if (isFromCart) {
                                    // NEW: Pass cart items to handlePaymentSubmit (update your hook/mutation to accept array)
                                    handlePaymentSubmit({
                                        ...paymentData,
                                        paymentProvider:
                                            paymentData.method === "CASH_ON_DELIVERY"
                                                ? "COD"
                                                : paymentData.method === "WALLET"
                                                    ? (paymentData.walletProvider?.toUpperCase().replace(/\s+/g, "") || "ESEWA")
                                                    : paymentData.method,
                                        paymentMethodId: selectedPaymentMethod?.id ?? null,
                                        items: orderItemsForSummary, // Pass full cart items
                                        shippingMethod: "STANDARD",
                                    });
                                } else {
                                    // Existing single-product logic
                                    const selectedVariant = variantId
                                        ? product.variants?.find((v: any) => v.id === variantId)
                                        : (product.variants?.find((v: any) => v.isDefault) || product.variants?.[0]);

                                    handlePaymentSubmit({
                                        ...paymentData,
                                        paymentProvider:
                                            paymentData.method === "CASH_ON_DELIVERY"
                                                ? "COD"
                                                : paymentData.method === "WALLET"
                                                    ? (paymentData.walletProvider?.toUpperCase().replace(/\s+/g, "") || "ESEWA")
                                                    : paymentData.method,
                                        paymentMethodId: selectedPaymentMethod?.id ?? null,
                                        variantId: selectedVariant?.id,
                                        quantity,
                                        shippingMethod: "STANDARD",
                                    });
                                }
                            }}
                            onInitiateFonepay={async () => {
                                if (isFromCart) {
                                    return await handleInitiateFonepay({
                                        items: orderItemsForSummary,
                                        shippingMethod: "STANDARD",
                                    });
                                } else {
                                    const selectedVariant = variantId
                                        ? product.variants?.find((v: any) => v.id === variantId)
                                        : (product.variants?.find((v: any) => v.isDefault) || product.variants?.[0]);

                                    return await handleInitiateFonepay({
                                        variantId: selectedVariant?.id,
                                        quantity,
                                        shippingMethod: "STANDARD",
                                    });
                                }
                            }}
                            onBackToAddress={handleBackToAddress}
                        />
                    )}
                </div>
                {/* RIGHT SIDE: Order Summary (UPDATED: Use cart data if from cart) */}
                <div className="lg:col-span-1">
                    {isFromCart ? (
                        cartLoading ? (
                            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        ) : cartItems.length > 0 ? (
                            // Use OrderSummary with cart-mapped items (it already supports multiple items)
                            <OrderSummary
                                items={orderItemsForSummary}
                                subtotal={cartSubtotal} // From cart calc
                                shipping={0}
                                tax={0}
                                total={orderAmount}
                                formatPrice={formatPrice}
                            />
                        ) : null
                    ) : productLoading ? (
                        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ) : product ? (
                        // Existing single-product OrderSummary
                        <OrderSummary
                            items={orderItemsForSummary}
                            subtotal={orderAmount}
                            shipping={0}
                            tax={0}
                            total={orderAmount}
                            formatPrice={formatPrice}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
}
