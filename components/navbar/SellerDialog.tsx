import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SellerButtonProps {
  isMobile?: boolean;
}

const SellerButton = ({ isMobile = false }: SellerButtonProps) => {
  const sellerDashboard = process.env.NEXT_PUBLIC_SELLER_URL;

  // If the env var is not set, don't render the button at all (or show fallback)
  if (!sellerDashboard) {
    return null; // or return a disabled button, or a placeholder
  }

  return (
    <Button
      asChild
      variant="outline"
      size={isMobile ? "lg" : "sm"}
      className={`text-sm lg:text-base text-foreground hover:bg-secondary border-border ${
        isMobile ? "w-full h-12" : "px-2 lg:px-4"
      }`}
    >
      <Link href={sellerDashboard} target="_blank" rel="noopener noreferrer">
        <span className={isMobile ? "" : "hidden lg:inline"}>
          Become a Seller
        </span>
        {!isMobile && <span className="lg:hidden">Sell</span>}
      </Link>
    </Button>
  );
};

export default SellerButton;
