// hooks/useBuyNow.ts
import {
  CREATE_ORDER,
  INITIATE_ESEWA_PAYMENT,
} from "@/client/payment/payment.mutations";
import { useMutation } from "@apollo/client";
import { useState } from "react";

export function useBuyNow() {
  const [step, setStep] = useState<"address" | "payment" | "summary">(
    "address"
  );
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [createOrder] = useMutation(CREATE_ORDER);
  const [initiateEsewaPayment] = useMutation(INITIATE_ESEWA_PAYMENT);

  const handleAddressSaved = (newAddress: any) => {
    setSelectedAddress(newAddress);
    setStep("payment");
    setShowAddressForm(false);
  };

  const handleAddressCancel = () => {
    // Reset to address selection mode
    setSelectedAddress(null);
    setShowAddressForm(false);
  };

  const handleUseDefaultAddress = () => {
    setStep("payment");
  };

  const handleSelectAddress = (address: any) => {
    setSelectedAddress(address);
    // Don't auto-advance, let user review and confirm
  };

  const handlePaymentMethodSelect = (method: any) => {
    setSelectedPaymentMethod(method);
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    setIsProcessingPayment(true);
    try {
      // Expect paymentData to include: variantId, quantity, paymentProvider, paymentMethodId?, shippingAddress snapshot
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
          paymentProvider: paymentData.paymentProvider,
          // paymentMethodId: paymentData.paymentMethodId ?? null,
        },
      } as any;

      const orderResult = await createOrder({ variables });
      const orderId = orderResult.data?.createOrder?.id;

      if (!orderId) {
        throw new Error("Failed to create order");
      }

      // Handle eSewa payment
      if (paymentData.paymentProvider === "ESEWA") {
        const esewaResult = await initiateEsewaPayment({
          variables: { orderId },
        });
        const paymentUrl = esewaResult.data?.initiateEsewaPayment?.paymentUrl;

        if (paymentUrl) {
          // Redirect to eSewa payment gateway
          window.location.href = paymentUrl;
          return;
        } else {
          throw new Error("Failed to get eSewa payment URL");
        }
      }

      // For non-eSewa payments, continue to summary
      setStep("summary");
    } catch (e) {
      console.error("Order creation failed", e);
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
