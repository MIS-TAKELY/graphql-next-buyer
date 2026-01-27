// app/(main)/buy-now/page.tsx
"use client";

import { CheckoutFlow } from "@/components/page/checkout/CheckoutFlow";
import { Suspense } from "react";

export default function BuyNowPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutFlow />
    </Suspense>
  );
}
