"use client";

import {
  CREATE_ORDER,
  INITIATE_ESEWA_PAYMENT,
  INITIATE_FONEPAY_PAYMENT,
  VERIFY_FONEPAY_PAYMENT,
} from "@/client/payment/payment.mutations";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const [initiateFonepay] = useMutation(INITIATE_FONEPAY_PAYMENT);
  const [verifyFonepay] = useMutation(VERIFY_FONEPAY_PAYMENT);

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
      let paymentProvider = paymentData.walletProvider
        ? paymentData.walletProvider.toUpperCase().replace(/\s+/g, "")
        : paymentData.paymentProvider;

      // Map PHONEPE to FONEPAY for consistency with backend
      if (paymentProvider === "PHONEPE") {
        paymentProvider = "FONEPAY";
      }

      const supportedProviders = ["ESEWA", "KHALTI", "IMEPAY", "COD", "FONEPAY"];
      if (!supportedProviders.includes(paymentProvider)) {
        throw new Error(`Unsupported payment provider: ${paymentProvider}`);
      }

      let orderIds: string[] = paymentData.orderId ? [paymentData.orderId] : [];

      if (orderIds.length === 0) {
        if (paymentData.items && paymentData.items.length > 0) {
          // MULTIPLE ORDERS CASE
          const ordersInput = [
            {
              items: paymentData.items.map((item: any) => ({
                variantId: item.variantId || item.variant?.id,
                quantity: item.quantity,
              })),
              shippingAddress: {
                line1: selectedAddress?.line1,
                label: selectedAddress?.label || "Shipping Address",
                line2: selectedAddress?.line2 ?? null,
                city: selectedAddress?.city,
                state: selectedAddress?.state,
                postalCode: selectedAddress?.postalCode,
                country: selectedAddress?.country,
                phoneNumber: selectedAddress?.phoneNumber || "",
              },
              billingAddress: null,
              shippingMethod: paymentData.shippingMethod ?? "STANDARD",
              paymentProvider,
            },
          ];

          const ordersResult = await createOrder({
            variables: { input: ordersInput },
          });
          orderIds = ordersResult.data.createOrder.map((o: any) => o.id);
        } else {
          // SINGLE ORDER CASE
          const variables = {
            input: [
              {
                items: [
                  {
                    variantId: paymentData.variantId,
                    quantity: paymentData.quantity ?? 1,
                  },
                ],
                shippingAddress: {
                  line1: selectedAddress?.line1,
                  label: selectedAddress?.label || "Shipping Address",
                  line2: selectedAddress?.line2 ?? null,
                  city: selectedAddress?.city,
                  state: selectedAddress?.state,
                  postalCode: selectedAddress?.postalCode,
                  country: selectedAddress?.country,
                  phoneNumber: selectedAddress?.phoneNumber || "",
                },
                billingAddress: null,
                shippingMethod: paymentData.shippingMethod ?? "STANDARD",
                paymentProvider,
              },
            ],
          };

          const orderResult = await createOrder({ variables });
          const orderId = orderResult.data?.createOrder?.[0]?.id;
          if (!orderId) throw new Error("Failed to create order");
          orderIds = [orderId];
        }
      }

      // Handle REDIRECTION or VERIFICATION
      if (paymentProvider === "COD") {
        router.push(`/payment/success/?orderId=${orderIds[0]}`);
        return;
      }

      if (paymentProvider === "FONEPAY") {
        const { data } = await verifyFonepay({
          variables: {
            orderId: orderIds[0],
            transactionId: paymentData.transactionId,
            signature: paymentData.signature || "",
            amount: paymentData.amount || "0",
          },
        });

        if (data.verifyFonepayPayment.success) {
          router.push(`/payment/success/?orderId=${orderIds[0]}`);
        } else {
          alert(data.verifyFonepayPayment.message || "Payment verification failed");
        }
        return;
      }

      if (paymentProvider === "ESEWA") {
        for (const id of orderIds) {
          const esewaResult = await initiateEsewaPayment({
            variables: { orderId: id },
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
            return;
          } else {
            alert(
              esewaResult.data.initiateEsewaPayment.error ||
              "Payment initiation failed"
            );
          }
        }
      }

      setStep("summary");
    } catch (e: any) {
      console.error("Order completion failed:", e);
      // Try to get specific error message from GraphQL error
      const errorMessage = e.graphQLErrors?.[0]?.message || e.message || "Failed to complete order";
      alert(errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleInitiateFonepay = async (paymentData: any) => {
    try {
      const isFromCart = !!paymentData.items;
      let orderId: string | null = null;

      if (isFromCart) {
        const ordersInput = [{
          items: paymentData.items.map((item: any) => ({
            variantId: item.variantId || item.variant?.id,
            quantity: item.quantity,
          })),
          shippingAddress: {
            line1: selectedAddress?.line1,
            label: selectedAddress?.label || "Shipping Address",
            line2: selectedAddress?.line2 ?? null,
            city: selectedAddress?.city,
            state: selectedAddress?.state,
            postalCode: selectedAddress?.postalCode,
            country: selectedAddress?.country,
            phoneNumber: selectedAddress?.phoneNumber || "",
          },
          billingAddress: null,
          shippingMethod: paymentData.shippingMethod ?? "STANDARD",
          paymentProvider: "FONEPAY",
        }];

        const ordersResult = await createOrder({
          variables: { input: ordersInput },
        });
        orderId = ordersResult.data.createOrder[0].id;
      } else {
        const variables = {
          input: [{
            items: [{
              variantId: paymentData.variantId,
              quantity: paymentData.quantity ?? 1,
            }],
            shippingAddress: {
              line1: selectedAddress?.line1,
              label: selectedAddress?.label || "Shipping Address",
              line2: selectedAddress?.line2 ?? null,
              city: selectedAddress?.city,
              state: selectedAddress?.state,
              postalCode: selectedAddress?.postalCode,
              country: selectedAddress?.country,
              phoneNumber: selectedAddress?.phoneNumber || "",
            },
            billingAddress: null,
            shippingMethod: paymentData.shippingMethod ?? "STANDARD",
            paymentProvider: "FONEPAY",
          }],
        };

        const orderResult = await createOrder({ variables });
        orderId = orderResult.data?.createOrder?.[0]?.id;
      }

      if (!orderId) throw new Error("Failed to create order");

      const { data } = await initiateFonepay({ variables: { orderId } });
      return {
        success: data?.initiateFonepayPayment?.success,
        qrValue: data?.initiateFonepayPayment?.qrValue,
        error: data?.initiateFonepayPayment?.error,
        orderId,
      };
    } catch (error: any) {
      console.error("Fonepay initiation failed:", error);
      const errorMessage = error.graphQLErrors?.[0]?.message || error.message || "Failed to initiate Fonepay";
      return { success: false, error: errorMessage };
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
    handleInitiateFonepay,
    handleBackToAddress,
    handleBackToPayment,
  };
}
