import PaymentStatus from "@/components/page/payment/PaymentStatus";
import { Suspense } from "react";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentStatus status="success" />
    </Suspense>
  );
}
