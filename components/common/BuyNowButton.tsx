"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Zap, Bell, BellOff, Check } from "lucide-react";
import { NotifyMeModal } from "@/components/page/product/NotifyMeModal";
import { useMutation, useQuery } from "@apollo/client";
import {
  CREATE_PRODUCT_NOTIFICATION,
  CANCEL_PRODUCT_NOTIFICATION,
  HAS_ACTIVE_NOTIFICATION
} from "@/client/productNotification/productNotification.mutations";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

interface BuyNowButtonProps {
  productSlug: string;
  quantity?: number;
  inStock: boolean;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  showIcon?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  isFromCart: boolean;
  variantId?: string;
  productId?: string;
  productName?: string;
}

export function BuyNowButton({
  productSlug,
  quantity = 1,
  inStock,
  className = "",
  size = "lg",
  variant = "default",
  showIcon = true,
  fullWidth = true,
  disabled = false,
  children,
  onClick,
  isFromCart,
  variantId,
  productId,
  productName,
}: BuyNowButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [showNotifyModal, setShowNotifyModal] = useState(false);

  // Check if user has active notification (only for logged-in users)
  const { data: notificationData, refetch: refetchNotificationStatus } = useQuery(
    HAS_ACTIVE_NOTIFICATION,
    {
      variables: { productId, variantId },
      skip: !session?.user || !productId || inStock,
      fetchPolicy: "network-only", // Always fetch fresh data
      notifyOnNetworkStatusChange: true,
    }
  );

  const hasActiveNotification = notificationData?.hasActiveNotification || false;

  const [createNotification, { loading: notificationLoading }] = useMutation(
    CREATE_PRODUCT_NOTIFICATION,
    {
      onCompleted: (data) => {
        console.log("Notification created successfully:", data);
        toast.success("You'll be notified when this product is back in stock!");
        setShowNotifyModal(false);
        refetchNotificationStatus();
      },
      onError: (error) => {
        console.error("Error creating notification:", error);
        console.error("GraphQL errors:", error.graphQLErrors);
        console.error("Network error:", error.networkError);
        toast.error(error.message || "Failed to subscribe to notifications");
      },
      context: {
        fetchOptions: {
          timeout: 10000, // 10 second timeout
        },
      },
    }
  );

  const [cancelNotification, { loading: cancelLoading }] = useMutation(
    CANCEL_PRODUCT_NOTIFICATION,
    {
      onCompleted: () => {
        toast.success("Notification cancelled");
        refetchNotificationStatus();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to cancel notification");
      },
    }
  );

  const handleBuyNow = useCallback(() => {
    onClick?.();

    if (disabled) return;

    if (!inStock) {
      // If user already has notification, cancel it
      if (hasActiveNotification && session?.user) {
        if (!productId) {
          toast.error("Product information missing");
          return;
        }

        cancelNotification({
          variables: {
            productId,
            variantId,
          },
        });
        return;
      }

      // Handle notify me functionality
      if (session?.user) {
        // User is logged in, directly create notification
        if (!productId) {
          toast.error("Product information missing");
          return;
        }

        console.log("Creating notification for logged-in user:", {
          productId,
          variantId,
          userId: session.user.id,
        });

        createNotification({
          variables: {
            input: {
              productId,
              variantId,
            },
          },
        }).catch((err) => {
          console.error("Mutation error caught:", err);
        });
      } else {
        // User not logged in, show modal to collect email/phone
        setShowNotifyModal(true);
      }
      return;
    }

    if (isFromCart) {
      const searchParams = new URLSearchParams({
        from: "cart",
      });
      router.push(`/buy-now?${searchParams.toString()}`);
    } else {
      const searchParams = new URLSearchParams({
        product: productSlug,
        quantity: quantity.toString(),
      });
      if (variantId) {
        searchParams.append("variant", variantId);
      }
      router.push(`/buy-now?${searchParams.toString()}`);
    }
  }, [disabled, inStock, productSlug, quantity, router, onClick, isFromCart, variantId, productId, session, createNotification, hasActiveNotification, cancelNotification]);

  const handleNotifySubmit = (data: { email?: string; phone?: string }) => {
    if (!productId) {
      toast.error("Product information missing");
      return;
    }

    createNotification({
      variables: {
        input: {
          productId,
          variantId,
          ...data,
        },
      },
    });
  };

  const isDisabled = disabled;
  const showNotifyMe = !inStock;
  const isLoading = notificationLoading || cancelLoading;

  // Determine button text and icon
  let buttonText = "Buy Now";
  let ButtonIcon = Zap;
  let buttonStyle = "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl";
Notification
  if (showNotifyMe) {
    if (hasActiveNotification) {
      buttonText = "Reminder Set";
      ButtonIcon = Check;
      buttonStyle = "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl";
    } else {
      buttonText = "Notify Me";
      ButtonIcon = Bell;
      buttonStyle = "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl";
    }
  }

  return (
    <>
      <Button
        size={size}
        variant={showNotifyMe ? "secondary" : variant}
        onClick={handleBuyNow}
        disabled={isDisabled || isLoading}
        className={`transition-all duration-200 transform w-full active:scale-[0.98] min-h-[48px] ${fullWidth ? "flex-1" : ""
          } ${buttonStyle} ${className}`}
      >
        <span className="flex items-center justify-center gap-2">
          {showIcon && <ButtonIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
          <span className="transition-all duration-200 font-semibold">
            {isLoading ? "Processing..." : (children || buttonText)}
          </span>
          {hasActiveNotification && showNotifyMe && (
            <span className="text-xs opacity-75 ml-1">(Click to cancel)</span>
          )}
        </span>
      </Button>

      <NotifyMeModal
        open={showNotifyModal}
        onOpenChange={setShowNotifyModal}
        onSubmit={handleNotifySubmit}
        isLoading={notificationLoading}
        productName={productName}
      />
    </>
  );
}

