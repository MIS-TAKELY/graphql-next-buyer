// app/(main)/checkout/page.tsx
"use client";

import { CheckoutFlow } from "@/components/page/checkout/CheckoutFlow";
import { Suspense } from "react";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading checkout...</div>}>
      {/* Force Cart Mode for /checkout route */}
      <CheckoutFlow isCartOverride={true} />
    </Suspense>
  );
}
