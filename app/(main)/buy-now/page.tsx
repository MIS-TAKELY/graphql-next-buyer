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
import { useMutation, useQuery } from "@apollo/client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function BuyNowPageInner() {
  const [currentStep, setCurrentStep] = useState(1);
  const searchParams = useSearchParams();
  const productSlug = searchParams.get("product");

  console.log("product slug-->", productSlug);
  const quantity = parseInt(searchParams.get("quantity") || "1");

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
    handleBackToAddress,
    handleBackToPayment,
  } = useBuyNow();

  const [verifyEsewaPayment] = useMutation(VERIFY_ESEWA_PAYMENT);

  // Query product
  const { data: productData, loading: productLoading, error:productDataError} = useQuery(
    GET_PRODUCT_BY_SLUG,
    {
      variables: { slug: productSlug },
      fetchPolicy: "cache-first",
      errorPolicy: "all",
    }
  );

  console.log("error",productDataError)

  console.log("prpduct data-->", productData);
  // Query user addresses
  const { data: addressData, loading: addressLoading } =
    useQuery(GET_ADDRESS_OF_USER);

  const product = productData?.getProductBySlug;
  const addresses = addressData?.getAddressOfUser || [];

  // Calculate order amount
  const calculateOrderAmount = () => {
    if (!product || !product.variants) return 0;
    const defaultVariant =
      product.variants.find((v: any) => v.isDefault) || product.variants[0];
    if (!defaultVariant) return 0;

    const subtotal = defaultVariant.price * quantity;
    const shipping = 0;
    const tax = Math.round(subtotal * 0.18);
    return subtotal + shipping + tax;
  };

  const orderAmount = calculateOrderAmount();

  // Handle eSewa callback
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

          // Move to summary step on successful verification
          setCurrentStep(3);
        } catch (error) {
          console.error("Failed to verify eSewa payment:", error);
          // Handle verification failure
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
  }, [addresses]);

  // Show error if callback failed
  if (searchParams.get("error")) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Payment callback failed. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* {!productLoading && !product && (
        <div className="text-center text-red-500">Product not found</div>
      )} */}
      <BuyNowHeader
        productSlug={productSlug || ""}
        productName={product?.name}
      />

      <BuyNowSteps currentStep={currentStep} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SIDE: Address & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address section */}
          {addressLoading ? (
            <div className="space-y-4">
              <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
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

          {/* Payment section */}
          {step === "payment" && product && (
            <PaymentStep
              selectedAddress={selectedAddress}
              selectedPaymentMethod={selectedPaymentMethod}
              orderAmount={orderAmount}
              isProcessingPayment={isProcessingPayment}
              onPaymentMethodSelect={handlePaymentMethodSelect}
              onPaymentSubmit={(paymentData: any) => {
                const defaultVariant =
                  product.variants?.find((v: any) => v.isDefault) ||
                  product.variants?.[0];
                handlePaymentSubmit({
                  ...paymentData,
                  paymentProvider:
                    paymentData.method === "CASH_ON_DELIVERY"
                      ? "COD"
                      : paymentData.method === "WALLET"
                      ? "ESEWA"
                      : paymentData.method,
                  paymentMethodId: selectedPaymentMethod?.id ?? null,
                  variantId: defaultVariant?.id,
                  quantity,
                  shippingMethod: "STANDARD",
                });
              }}
              onBackToAddress={handleBackToAddress}
            />
          )}
        </div>

        {/* RIGHT SIDE: Order Summary */}
        <div className="lg:col-span-1">
          {productLoading ? (
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          ) : product ? (
            <OrderSummary
              items={[
                {
                  id: product.id,
                  quantity,
                  price:
                    product.variants?.find((v: any) => v.isDefault)?.price ||
                    product.variants?.[0]?.price ||
                    0,
                  variant: {
                    id:
                      product.variants?.find((v: any) => v.isDefault)?.id ||
                      product.variants?.[0]?.id ||
                      "1",
                    price:
                      product.variants?.find((v: any) => v.isDefault)?.price ||
                      product.variants?.[0]?.price ||
                      0,
                    attributes:
                      product.variants?.find((v: any) => v.isDefault)
                        ?.attributes || product.variants?.[0]?.attributes,
                    product: {
                      name: product.name,
                      images: product.images || [],
                    },
                  },
                },
              ]}
              subtotal={orderAmount - Math.round((orderAmount / 1.18) * 0.18)}
              shipping={0}
              tax={Math.round((orderAmount / 1.18) * 0.18)}
              total={orderAmount}
              formatPrice={(priceInCents: number) =>
                `₹${(priceInCents / 100).toLocaleString("en-IN")}`
              }
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function BuyNowPage() {
  return (
    <Suspense
      fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}
    >
      <BuyNowPageInner />
    </Suspense>
  );
}
