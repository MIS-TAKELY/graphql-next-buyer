// hooks/useBuyNow.ts
import { CREATE_ORDER } from "@/client/payment/payment.mutations";
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

      await createOrder({ variables });
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
