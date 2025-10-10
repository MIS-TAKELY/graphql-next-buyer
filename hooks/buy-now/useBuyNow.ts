"use client";

import {
  CREATE_ORDER,
  CREATE_ORDERS,
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
  const [createOrders] = useMutation(CREATE_ORDERS);
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

    if (!paymentData) console.log("payment data not avilable");

    // console.log("paymentdata---?", paymentData);
    // const output = paymentData?.items?.map((data: any) => data);

    // const output2 = output.map((v: any) => v);
    // console.log("output-->", output2);

    try {
      const paymentProvider = paymentData.walletProvider
        ? paymentData.walletProvider.toUpperCase()
        : paymentData.paymentProvider;

      const supportedProviders = ["ESEWA", "KHALTI", "IMEPAY", "COD"];
      if (!supportedProviders.includes(paymentProvider)) {
        throw new Error("Unsupported payment provider");
      }

      if (paymentData.items && paymentData.items.length > 0) {
        console.log("paymentdata---?", paymentData);

        // MULTIPLE ORDERS CASE
        const ordersInput = [
          {
            items: paymentData.items.map((item: any) => ({
              variantId: item.variantId || item.variant?.id,
              quantity: item.quantity,
            })),
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
            paymentProvider,
          },
        ];
        console.log("ordersInput -->", ordersInput);

        const ordersResult = await createOrders({
          variables: { input: ordersInput },
        });

        console.log("Multiple orders result:", ordersResult);

        // Handle COD (redirect to success)
        if (paymentProvider === "COD") {
          router.push(`/payment/success`);
        }

        // For eSewa, Khalti, etc., we’ll handle per order
        if (paymentProvider === "ESEWA") {
          for (const order of ordersResult.data.createOrders) {
            const esewaResult = await initiateEsewaPayment({
              variables: { orderId: order.id },
            });

            if (esewaResult.data.initiateEsewaPayment.success) {
              const form = document.createElement("form");
              form.method = "POST";
              form.action = esewaResult.data.initiateEsewaPayment.paymentUrl;

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
              return; // Stop after first redirect
            } else {
              alert(
                esewaResult.data.initiateEsewaPayment.error ||
                  "Payment initiation failed"
              );
            }
          }
        }
      } else {
        // SINGLE ORDER CASE (existing logic)
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
            paymentProvider,
          },
        };

        const orderResult = await createOrder({ variables });
        const orderId = orderResult.data?.createOrder?.id;

        if (!orderResult) throw new Error("Failed to create order");

        if (paymentProvider === "COD" && orderId) {
          router.push(`/payment/success/?orderId=${orderId}`);
        }

        if (paymentProvider === "ESEWA") {
          const esewaResult = await initiateEsewaPayment({
            variables: { orderId },
          });

          if (esewaResult.data.initiateEsewaPayment.success) {
            const form = document.createElement("form");
            form.method = "POST";
            form.action = esewaResult.data.initiateEsewaPayment.paymentUrl;

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
      }

      setStep("summary");
    } catch (e) {
      console.error("Order creation failed:", e);
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
