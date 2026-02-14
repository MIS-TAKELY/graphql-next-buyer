/**
 * Example: Purchase Guard Integration
 * 
 * This file demonstrates how to integrate the purchase guard
 * into your checkout flow and product pages.
 */

import { canPurchase, getVerificationStatus } from "@/lib/guards/purchase-guard";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/**
 * Example 1: Checkout Page Integration
 */
export function CheckoutPageExample() {
    const { data: session } = useSession();
    const router = useRouter();

    const handleCheckout = async () => {
        const purchaseCheck = canPurchase(session?.user);

        if (!purchaseCheck.allowed) {
            toast.error(purchaseCheck.reason);

            // Redirect based on missing verification
            if (purchaseCheck.missingVerification === "email") {
                router.push("/auth?step=email-verification");
            } else if (purchaseCheck.missingVerification === "phone") {
                router.push("/auth?step=phone-verification");
            } else {
                router.push("/auth?step=signup");
            }
            return;
        }

        // Proceed with checkout
        // ... your checkout logic here
    };

    return (
        <button onClick={handleCheckout}>
            Proceed to Checkout
        </button>
    );
}

/**
 * Example 2: Buy Now Button Integration
 */
export function BuyNowButtonExample({ productId }: { productId: string }) {
    const { data: session } = useSession();
    const router = useRouter();

    const handleBuyNow = async () => {
        const purchaseCheck = canPurchase(session?.user);

        if (!purchaseCheck.allowed) {
            toast.error(purchaseCheck.reason);

            if (purchaseCheck.missingVerification === "phone") {
                // Show phone verification modal or redirect
                router.push("/auth?step=phone-verification&redirect=/checkout");
            } else {
                router.push("/auth?step=signup");
            }
            return;
        }

        // Add to cart and proceed to checkout
        // ... your buy now logic here
    };

    return (
        <button onClick={handleBuyNow}>
            Buy Now
        </button>
    );
}

/**
 * Example 3: Display Verification Status
 */
export function VerificationStatusBanner() {
    const { data: session } = useSession();
    const status = getVerificationStatus(session?.user);

    if (!session?.user) return null;

    if (!status.emailVerified) {
        return (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm text-yellow-700">
                    Please verify your email to access all features.
                </p>
            </div>
        );
    }

    if (!status.phoneVerified) {
        return (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-sm text-blue-700">
                    Verify your phone number to make purchases.
                </p>
            </div>
        );
    }

    return null;
}

/**
 * Example 4: Add to Cart with Verification Check
 */
export function AddToCartExample({ productId }: { productId: string }) {
    const { data: session } = useSession();

    const handleAddToCart = async () => {
        // Allow adding to cart without verification
        // But show a message if they can't checkout yet

        // ... add to cart logic here

        const purchaseCheck = canPurchase(session?.user);
        if (!purchaseCheck.allowed) {
            toast.info("Item added to cart. " + purchaseCheck.reason + " to complete your purchase.");
        } else {
            toast.success("Item added to cart!");
        }
    };

    return (
        <button onClick={handleAddToCart}>
            Add to Cart
        </button>
    );
}
