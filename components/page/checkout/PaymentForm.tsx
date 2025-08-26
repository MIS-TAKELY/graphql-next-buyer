"use client";

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

import IMEPay from "@/assets/payments-walltes-logo/IME-Pay.png";
import Esewa from "@/assets/payments-walltes-logo/esewa.png";
import Khalti from "@/assets/payments-walltes-logo/khalti.png";
import Image from "next/image";

const walletLogos: Record<string, any> = {
  esewa: Esewa,
  imepay: IMEPay,
  khalti: Khalti,
};

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
}

export function PaymentForm({
  paymentMethod,
  onSubmit,
  isProcessing,
  amount,
}: PaymentFormProps) {
  const [formData, setFormData] = useState({
    // Card details
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardHolderName: "",
    // UPI details
    upiId: "",
    // Net banking
    bankName: "",
    // Wallet details
    walletProvider: "",
    walletNumber: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
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

    // Validate expiry date
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

    if (formData.walletProvider && !formData.walletNumber) {
      newErrors.walletNumber = "Wallet number/phone is required";
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
        // No validation needed for COD
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod.type === "CASH_ON_DELIVERY") {
      // No validation needed for COD
      onSubmit({ method: paymentMethod.type });
      return;
    }

    if (validateForm()) {
      onSubmit({ method: paymentMethod.type, ...formData });
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

  const formatPrice = (priceInCents: number) => {
    return `₹${(priceInCents / 100).toLocaleString("en-IN")}`;
  };

  // Render different forms based on payment method
  const renderPaymentForm = () => {
    switch (paymentMethod.type) {
      case "CREDIT_CARD":
      case "DEBIT_CARD":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
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
                  className={`pl-10 ${
                    errors.cardNumber ? "border-red-500" : ""
                  }`}
                />
                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              {errors.cardNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Month *
                </label>
                <select
                  value={formData.expiryMonth}
                  onChange={(e) =>
                    handleInputChange("expiryMonth", e.target.value)
                  }
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.expiryMonth ? "border-red-500" : ""
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
                  <p className="text-red-500 text-sm mt-1">
                    {errors.expiryMonth}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Year *</label>
                <select
                  value={formData.expiryYear}
                  onChange={(e) =>
                    handleInputChange("expiryYear", e.target.value)
                  }
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.expiryYear ? "border-red-500" : ""
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
                  <p className="text-red-500 text-sm mt-1">
                    {errors.expiryYear}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">CVV *</label>
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
                    className={`pl-10 ${errors.cvv ? "border-red-500" : ""}`}
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                {errors.cvv && (
                  <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
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
                  className={`pl-10 ${
                    errors.cardHolderName ? "border-red-500" : ""
                  }`}
                />
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              {errors.cardHolderName && (
                <p className="text-red-500 text-sm mt-1">
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
              <label className="block text-sm font-medium mb-2">UPI ID *</label>
              <div className="relative">
                <Input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) =>
                    handleInputChange("upiId", e.target.value.toLowerCase())
                  }
                  placeholder="yourname@paytm"
                  className={`pl-10 ${errors.upiId ? "border-red-500" : ""}`}
                />
                <Smartphone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              {errors.upiId && (
                <p className="text-red-500 text-sm mt-1">{errors.upiId}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">
                    UPI Payment
                  </h4>
                  <p className="text-sm text-blue-700">
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
              <label className="block text-sm font-medium mb-2">
                Select Your Bank *
              </label>
              <div className="relative">
                <select
                  value={formData.bankName}
                  onChange={(e) =>
                    handleInputChange("bankName", e.target.value)
                  }
                  className={`w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.bankName ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Choose your bank</option>
                  <option value="sbi">State Bank of India</option>
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                  <option value="axis">Axis Bank</option>
                  <option value="kotak">Kotak Mahindra Bank</option>
                  <option value="pnb">Punjab National Bank</option>
                  <option value="canara">Canara Bank</option>
                  <option value="bob">Bank of Baroda</option>
                  <option value="union">Union Bank of India</option>
                  <option value="yes">Yes Bank</option>
                </select>
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              {errors.bankName && (
                <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-900">
                    Net Banking
                  </h4>
                  <p className="text-sm text-yellow-700">
                    You will be redirected to your bank's website to complete
                    the payment.
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
              <label className="block text-sm font-medium mb-2">
                Select Wallet Provider *
              </label>
              <div className="grid gap-3">
                {paymentMethod.providers?.map((provider) => {

                  const key = provider.toLowerCase().replace(/\s+/g, "");
                  const logo = walletLogos[key];

                  return (
                    <div key={provider} className="flex items-center space-x-2">
                      {logo && (
                        <Image
                          src={logo}
                          alt={provider}
                          height={45}
                          width={45}
                        />
                      )}
                      <span className="text-sm font-medium">{provider}</span>
                    </div>
                  );
                })}
              </div>
              {errors.walletProvider && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.walletProvider}
                </p>
              )}
            </div>

            {/* {formData.walletProvider && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mobile Number *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-sm text-gray-500">
                    +91
                  </span>
                  <Input
                    type="tel"
                    value={formData.walletNumber}
                    onChange={(e) =>
                      handleInputChange(
                        "walletNumber",
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    placeholder="9876543210"
                    maxLength={10}
                    className={`pl-12 ${
                      errors.walletNumber ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {errors.walletNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.walletNumber}
                  </p>
                )}
              </div>
            )} */}
          </div>
        );

      case "CASH_ON_DELIVERY":
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Cash on Delivery
              </h3>
              <p className="text-sm text-green-700 mb-4">
                You can pay in cash when your order is delivered to your
                doorstep.
              </p>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    Amount to pay on delivery:
                  </span>
                  <span className="font-bold text-green-600">
                    {formatPrice(amount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">
                    Important Notes:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
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

      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold">Total Amount:</span>
          <span className="text-2xl font-bold text-blue-600">
            {formatPrice(amount)}
          </span>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
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
