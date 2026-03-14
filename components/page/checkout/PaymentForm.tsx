// components/page/checkout/PaymentForm.tsx
"use client";

import { formatPrice } from "@/lib/utils";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Building2,
  CheckCircle,
  CreditCard,
  Loader2,
  Lock,
  Smartphone,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import IMEPay from "@/assets/payments-walltes-logo/IME-Pay.png";
import Esewa from "@/assets/payments-walltes-logo/esewa.png";
import Khalti from "@/assets/payments-walltes-logo/khalti.png";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { useMutation } from "@apollo/client";
import { gql } from "graphql-tag";

const walletLogos: Record<string, any> = {
  esewa: Esewa,
  imepay: IMEPay,
  khalti: Khalti,
  fonepay: Esewa, // Using Esewa as placeholder if Fonepay logo not found, or add it
};

const INITIATE_FONEPAY_PAYMENT = gql`
  mutation InitiateFonepayPayment($orderId: ID!) {
    initiateFonepayPayment(orderId: $orderId) {
      success
      qrValue
      error
    }
  }
`;

const VERIFY_FONEPAY_PAYMENT = gql`
  mutation VerifyFonepayPayment($orderId: ID!, $transactionId: String!) {
    verifyFonepayPayment(orderId: $orderId, transactionId: $transactionId) {
      success
      message
    }
  }
`;

interface PaymentMethod {
  id: string;
  type: string;
  name: string;
  providers?: string[];
}

interface PaymentFormProps {
  paymentMethod: PaymentMethod;
  onSubmit: (paymentData: any) => void;
  isProcessing: boolean;
  amount: number;
  onInitiateFonepay?: () => Promise<{ success: boolean; qrValue?: string; error?: string }>;
}



export function PaymentForm({
  paymentMethod,
  onSubmit,
  isProcessing,
  amount,
  onInitiateFonepay,
}: PaymentFormProps) {
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardHolderName: "",
    upiId: "",
    bankName: "",
    walletProvider: "",
    transactionId: "",
    receiptUrl: "",
  });

  const [qrValue, setQrValue] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);

  const [verifyFonepay] = useMutation(VERIFY_FONEPAY_PAYMENT);

  const handlePhonePayInitiation = async () => {
    if (!onInitiateFonepay) {
      console.error("onInitiateFonepay not provided");
      return;
    }

    setIsInitiating(true);
    try {
      const result = await onInitiateFonepay();
      if (result.success && result.qrValue) {
        setQrValue(result.qrValue);
        if ((result as any).orderId) {
          setOrderId((result as any).orderId);
        }
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error: any) {
      console.error("Failed to initiate Fonepay:", error);
      toast.error("Failed to initiate Fonepay payment");
    } finally {
      setIsInitiating(false);
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateCardForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cardNumber.replace(/\s/g, "")) {
      newErrors.cardNumber = "Card number is required";
    } else if (formData.cardNumber.replace(/\s/g, "").length < 16) {
      newErrors.cardNumber = "Please enter a valid card number";
    }

    if (!formData.expiryMonth) newErrors.expiryMonth = "Month is required";
    if (!formData.expiryYear) newErrors.expiryYear = "Year is required";
    if (!formData.cvv) newErrors.cvv = "CVV is required";
    if (!formData.cardHolderName.trim())
      newErrors.cardHolderName = "Cardholder name is required";

    if (formData.expiryMonth && formData.expiryYear) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const expMonth = parseInt(formData.expiryMonth);
      const expYear = parseInt(formData.expiryYear);

      if (
        expYear < currentYear ||
        (expYear === currentYear && expMonth < currentMonth)
      ) {
        newErrors.expiryMonth = "Card has expired";
      }
    }

    return newErrors;
  };

  const validateUPIForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.upiId) {
      newErrors.upiId = "UPI ID is required";
    } else if (!/^[\w\.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(formData.upiId)) {
      newErrors.upiId = "Please enter a valid UPI ID";
    }

    return newErrors;
  };

  const validateNetBankingForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bankName) {
      newErrors.bankName = "Please select your bank";
    }

    return newErrors;
  };

  const validateWalletForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.walletProvider) {
      newErrors.walletProvider = "Please select wallet provider";
    }

    if (formData.walletProvider && !formData.transactionId) {
      newErrors.transactionId = "Transaction ID is mandatory for wallet payments";
    }

    return newErrors;
  };

  const validateForm = () => {
    let newErrors: Record<string, string> = {};

    switch (paymentMethod.type) {
      case "CREDIT_CARD":
      case "DEBIT_CARD":
        newErrors = validateCardForm();
        break;
      case "UPI":
        newErrors = validateUPIForm();
        break;
      case "NET_BANKING":
        newErrors = validateNetBankingForm();
        break;
      case "WALLET":
        newErrors = validateWalletForm();
        break;
      case "CASH_ON_DELIVERY":
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("form data-->", formData)

    if (paymentMethod.type === "card") {
      toast.error("Please select a payment method");
      return;
    }

    if (paymentMethod.type === "CASH_ON_DELIVERY") {
      onSubmit({ method: paymentMethod.type });
      return;
    }

    if (validateForm()) {
      onSubmit({ method: paymentMethod.type, ...formData, orderId });
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const renderPaymentForm = () => {
    switch (paymentMethod.type) {
      case "CREDIT_CARD":
      case "DEBIT_CARD":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                Card Number *
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) =>
                    handleInputChange(
                      "cardNumber",
                      formatCardNumber(e.target.value)
                    )
                  }
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className={`pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${errors.cardNumber
                    ? "border-red-500 dark:border-red-400"
                    : ""
                    }`}
                />
                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              {errors.cardNumber && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {errors.cardNumber}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  Month *
                </label>
                <select
                  value={formData.expiryMonth}
                  onChange={(e) =>
                    handleInputChange("expiryMonth", e.target.value)
                  }
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.expiryMonth
                    ? "border-red-500 dark:border-red-400"
                    : ""
                    }`}
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option
                      key={month}
                      value={month.toString().padStart(2, "0")}
                    >
                      {month.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                {errors.expiryMonth && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {errors.expiryMonth}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  Year *
                </label>
                <select
                  value={formData.expiryYear}
                  onChange={(e) =>
                    handleInputChange("expiryYear", e.target.value)
                  }
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.expiryYear
                    ? "border-red-500 dark:border-red-400"
                    : ""
                    }`}
                >
                  <option value="">YY</option>
                  {Array.from(
                    { length: 20 },
                    (_, i) => new Date().getFullYear() + i
                  ).map((year) => (
                    <option key={year} value={year.toString().slice(-2)}>
                      {year.toString().slice(-2)}
                    </option>
                  ))}
                </select>
                {errors.expiryYear && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {errors.expiryYear}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  CVV *
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={formData.cvv}
                    onChange={(e) =>
                      handleInputChange(
                        "cvv",
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    placeholder="123"
                    maxLength={4}
                    className={`pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${errors.cvv ? "border-red-500 dark:border-red-400" : ""
                      }`}
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                {errors.cvv && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {errors.cvv}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                Cardholder Name *
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={formData.cardHolderName}
                  onChange={(e) =>
                    handleInputChange(
                      "cardHolderName",
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="JOHN DOE"
                  className={`pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${errors.cardHolderName
                    ? "border-red-500 dark:border-red-400"
                    : ""
                    }`}
                />
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              {errors.cardHolderName && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {errors.cardHolderName}
                </p>
              )}
            </div>
          </div>
        );

      case "UPI":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                UPI ID *
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) =>
                    handleInputChange("upiId", e.target.value.toLowerCase())
                  }
                  placeholder="yourname@paytm"
                  className={`pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${errors.upiId ? "border-red-500 dark:border-red-400" : ""
                    }`}
                />
                <Smartphone className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              {errors.upiId && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {errors.upiId}
                </p>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    UPI Payment
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    You will be redirected to your UPI app to complete the
                    payment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "NET_BANKING":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                Select Your Bank *
              </label>
              <div className="relative">
                <select
                  value={formData.bankName}
                  onChange={(e) =>
                    handleInputChange("bankName", e.target.value)
                  }
                  className={`w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.bankName ? "border-red-500 dark:border-red-400" : ""
                    }`}
                >
                  <option value="">Choose your bank</option>
                  <option value="nabil">Nabil Bank</option>
                  <option value="nimb">Nepal Investment Mega Bank (NIMB)</option>
                  <option value="global_ime">Global IME Bank</option>
                  <option value="prabhu">Prabhu Bank</option>
                  <option value="siddhartha">Siddhartha Bank</option>
                  <option value="everest">Everest Bank</option>
                  <option value="kumari">Kumari Bank</option>
                  <option value="laxmi_sunrise">Laxmi Sunrise Bank</option>
                  <option value="sanima">Sanima Bank</option>
                  <option value="machhapuchhre">Machhapuchhre Bank</option>
                  <option value="citizens">Citizens Bank International</option>
                  <option value="prime">Prime Commercial Bank</option>
                  <option value="nic_asia">NIC Asia Bank</option>
                  <option value="standard_chartered">Standard Chartered Bank Nepal</option>
                  <option value="himalayan">Himalayan Bank Ltd.</option>
                </select>
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              {errors.bankName && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {errors.bankName}
                </p>
              )}
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-600 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                    Net Banking
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    You will be redirected to your bank&apos;s website to
                    complete the payment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "WALLET":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                Select Wallet Provider *
              </label>
              <div className="grid gap-3">
                {paymentMethod.providers?.map((provider) => {
                  const key = provider.toLowerCase().replace(/\s+/g, "");
                  const logo = walletLogos[key];

                  return (
                    <label
                      key={provider}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 ${formData.walletProvider === provider
                        ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : ""
                        }`}
                    >
                      <input
                        type="radio"
                        name="walletProvider"
                        value={provider}
                        checked={formData.walletProvider === provider}
                        onChange={(e) =>
                          handleInputChange("walletProvider", e.target.value)
                        }
                        className="h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                      {logo && (
                        <Image
                          src={logo}
                          alt={provider}
                          height={40}
                          width={40}
                          unoptimized
                        />
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {provider}
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.walletProvider && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {errors.walletProvider}
                </p>
              )}
            </div>

            {formData.walletProvider && (
              <div className="mt-6 space-y-6 border-t pt-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white text-center">
                    Scan this QR code with your {formData.walletProvider} app to pay
                  </p>
                  <div className="p-3 bg-white rounded-2xl shadow-lg border-4 border-gray-100 dark:border-gray-800">
                    {/* 
                      Assuming static QR images are stored in /payments-qr/
                      If not found, it will fallback to the alt text or a placeholder
                    */}
                    <div className="relative w-48 h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded-lg overflow-hidden">
                      <Image
                        src={`/payments-qr/${formData.walletProvider.toLowerCase().replace(/\s+/g, "")}.png`}
                        alt={`${formData.walletProvider} QR Code`}
                        fill
                        className="object-contain"
                        onError={(e) => {
                          // Fallback to a placeholder or generic QR if file is missing
                          const target = e.target as HTMLImageElement;
                          target.src = "https://placehold.co/400x400?text=Scan+to+Pay";
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount to Pay:</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatPrice(amount)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                      Reference / Transaction Code (Mandatory) *
                    </label>
                    <Input
                      type="text"
                      value={formData.transactionId}
                      onChange={(e) => handleInputChange("transactionId", e.target.value)}
                      placeholder="Enter the code from your payment receipt"
                      className={`bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white ${errors.transactionId ? "border-red-500" : ""}`}
                    />
                    {errors.transactionId && (
                      <p className="text-red-500 text-xs mt-1">{errors.transactionId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                      Payment Receipt / PDF (Optional)
                    </label>
                    <div className="flex items-center gap-4">
                       <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const { uploadToCloudinary } = await import("@/servers/utils/uploadToCloudinary");
                              const res = await uploadToCloudinary(file);
                              handleInputChange("receiptUrl", res.url);
                              toast.success("Receipt uploaded successfully");
                            } catch (err) {
                              toast.error("Failed to upload receipt");
                              console.error(err);
                            }
                          }
                        }}
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                      {formData.receiptUrl && (
                        <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Max 5MB • JPG, PNG, PDF</p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    Once you've made the payment, please enter the transaction code and click "Pay" to place your order. Our team will verify the payment manually.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case "CASH_ON_DELIVERY":
        return (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-600 rounded-lg p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-200 mb-2">
                Cash on Delivery
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                You can pay in cash when your order is delivered to your
                doorstep.
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-600">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    Amount to pay on delivery:
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formatPrice(amount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                    Important Notes:
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Please keep the exact amount ready</li>
                    <li>
                      • Our delivery partner will carry a POS machine for card
                      payments
                    </li>
                    <li>• COD orders may take 1-2 days longer to process</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="my-5">{renderPaymentForm()}</div>

      <div className="border-t pt-6 border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Total Amount:
          </span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatPrice(amount)}
          </span>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : paymentMethod.type === "CASH_ON_DELIVERY" ? (
            "Place Order"
          ) : (
            `Pay ${formatPrice(amount)}`
          )}
        </Button>
      </div>
    </form>
  );
}
