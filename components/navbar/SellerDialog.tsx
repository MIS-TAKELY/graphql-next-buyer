import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SellerButtonProps {
  isMobile?: boolean;
  onItemClick?: () => void;
}

const SellerButton = ({ isMobile = false, onItemClick }: SellerButtonProps) => {
  // Determine the seller dashboard URL with fallback
  const sellerDashboard = process.env.NEXT_PUBLIC_SELLER_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://seller.vanijay.com"
      : "http://localhost:3001");

  return (
    <Button
      asChild
      variant="outline"
      size={isMobile ? "lg" : "sm"}
      onClick={onItemClick}
      className={`text-sm lg:text-base text-foreground hover:bg-secondary border-border ${isMobile ? "w-full h-12" : "px-2 lg:px-4"
        }`}
    >
      <Link href={sellerDashboard} target="_blank" rel="noopener noreferrer">
        <span className={isMobile ? "" : "hidden lg:inline"}>
          Become a father
        </span>
        {!isMobile && <span className="lg:hidden">Sell</span>}
      </Link>
    </Button>
  );
};

export default SellerButton;
