// components/page/checkout/PaymentStatus.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PaymentStatus({
  status,
}: {
  status: "success" | "failed";
}) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const message = searchParams.get("message");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 border border-gray-200 dark:border-gray-600">
        {status === "success" ? (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20">
              <svg
                className="h-10 w-10 text-green-500 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              Payment Successful!
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Your payment has been processed successfully.
            </p>
            {orderId && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Order ID: {orderId}</p>
            )}
            <div className="mt-6 space-y-3">
              <Link
                href={`/orders/${orderId}`}
                className="block w-full bg-green-600 dark:bg-green-500 text-white rounded-md py-2 text-center hover:bg-green-700 dark:hover:bg-green-400 transition-colors font-medium"
              >
                View Order
              </Link>
              <Link
                href="/"
                className="block w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md py-2 text-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20">
              <svg
                className="h-10 w-10 text-red-500 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              Payment Failed
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {message ||
                "There was an issue processing your payment. Please try again."}
            </p>
            <div className="mt-6 space-y-3">
              <Link
                href="/checkout"
                className="block w-full bg-blue-600 dark:bg-blue-500 text-white rounded-md py-2 text-center hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors font-medium"
              >
                Try Again
              </Link>
              <Link
                href="/"
                className="block w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md py-2 text-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}