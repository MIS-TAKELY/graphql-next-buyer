"use client";

import {
  CREATE_ORDER,
  INITIATE_ESEWA_PAYMENT,
} from "@/client/payment/payment.mutations";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
// import toast from "react-toastify"; // Assuming you use react-toastify for notifications

export function useBuyNow() {
  const [step, setStep] = useState<"address" | "payment" | "summary">(
    "address"
  );
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const router = useRouter();

  const [createOrder] = useMutation(CREATE_ORDER);
  const [initiateEsewaPayment] = useMutation(INITIATE_ESEWA_PAYMENT);

  const handleAddressSaved = (newAddress: any) => {
    setSelectedAddress(newAddress);
    setStep("payment");
    setShowAddressForm(false);
  };

  const handleAddressCancel = () => {
    setSelectedAddress(null);
    setShowAddressForm(false);
  };

  const handleUseDefaultAddress = () => {
    setStep("payment");
  };

  const handleSelectAddress = (address: any) => {
    setSelectedAddress(address);
  };

  const handlePaymentMethodSelect = (method: any) => {
    setSelectedPaymentMethod(method);
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    setIsProcessingPayment(true);
    try {
      const paymentProvider = paymentData.walletProvider
        ? paymentData.walletProvider.toUpperCase()
        : paymentData.paymentProvider;

      const supportedProviders = ["ESEWA", "KHALTI", "IMEPAY", "COD"];
      if (!supportedProviders.includes(paymentProvider)) {
        throw new Error("Unsupported payment provider");
      }

      const variables = {
        input: {
          items: [
            {
              variantId: paymentData.variantId,
              quantity: paymentData.quantity ?? 1,
            },
          ],
          shippingAddress: {
            line1: selectedAddress?.line1,
            label: selectedAddress?.label,
            line2: selectedAddress?.line2 ?? null,
            city: selectedAddress?.city,
            state: selectedAddress?.state,
            postalCode: selectedAddress?.postalCode,
            country: selectedAddress?.country,
            phone: selectedAddress?.phone ?? null,
          },
          billingAddress: null,
          shippingMethod: paymentData.shippingMethod ?? "STANDARD",
          couponCode: paymentData.couponCode ?? null,
          paymentProvider,
        },
      };

      const orderResult = await createOrder({ variables });
      const orderId = orderResult.data?.createOrder?.id;

      console.log("order reslt", orderResult);

      if (!orderId) {
        throw new Error("Failed to create order");
      }

      console.log("pay,emt provider", paymentProvider);

      if (paymentProvider === "COD" && orderId) {
        console.log("hello");
        router.push(
          `/payment/success/?orderId=${orderId}`
        );
      }

      // Handle eSewa payment
      if (paymentProvider === "ESEWA") {
        const esewaResult = await initiateEsewaPayment({
          variables: { orderId },
        });

        console.log("eSewa Result:", JSON.stringify(esewaResult, null, 2)); // Add logging

        if (esewaResult.data.initiateEsewaPayment.success) {
          // Create and submit form
          const form = document.createElement("form");
          form.method = "POST";
          form.action = esewaResult.data.initiateEsewaPayment.paymentUrl;

          // Add all payment data as hidden inputs
          Object.entries(
            esewaResult.data.initiateEsewaPayment.paymentData
          ).forEach(([key, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = value as string;
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
        } else {
          alert(
            esewaResult.data.initiateEsewaPayment.error ||
              "Payment initiation failed"
          );
        }
      }

      setStep("summary");
    } catch (e) {
      console.error("Order creation failed:", e);
      // toast.error(`Payment failed: ${e.message}`); // Ensure toast is imported
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleBackToAddress = () => {
    setStep("address");
  };

  const handleBackToPayment = () => {
    setStep("payment");
  };

  return {
    step,
    selectedAddress,
    showAddressForm,
    selectedPaymentMethod,
    isProcessingPayment,
    setSelectedAddress,
    setShowAddressForm,
    handleAddressSaved,
    handleAddressCancel,
    handleUseDefaultAddress,
    handleSelectAddress,
    handlePaymentMethodSelect,
    handlePaymentSubmit,
    handleBackToAddress,
    handleBackToPayment,
  };
}
