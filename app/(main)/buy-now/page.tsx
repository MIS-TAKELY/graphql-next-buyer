"use client";

import { GET_ADDRESS_OF_USER } from "@/client/address/address.queries";
import { GET_PRODUCT_BY_SLUG } from "@/client/product/product.queries";
import { AddressStep } from "@/components/page/buy-now/AddressStep";
import { BuyNowHeader } from "@/components/page/buy-now/BuyNowHeader";
import { BuyNowSteps } from "@/components/page/buy-now/BuyNowSteps";
import { PaymentStep } from "@/components/page/buy-now/PaymentStep";
import { OrderSummary } from "@/components/page/checkout/OrderSummary";
import { useBuyNow } from "@/hooks/buy-now/useBuyNow";
import { useQuery } from "@apollo/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function BuyNowPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const searchParams = useSearchParams();
  const productSlug = searchParams.get("product");
  const quantity = parseInt(searchParams.get("quantity") || "1");

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

  // Query product
  const { data: productData, loading: productLoading } = useQuery(
    GET_PRODUCT_BY_SLUG,
    {
      variables: { slug: productSlug },
      skip: !productSlug,
    }
  );

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

  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddress = addresses.find((addr: any) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    }
  }, [addresses]);

  return (
    <div className="container mx-auto px-4 py-8">
      {!productLoading && !product && (
        <div className="text-center text-red-500">Product not found</div>
      )}
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
