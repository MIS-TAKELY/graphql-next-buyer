import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Store } from "lucide-react";

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
      variant="ghost"
      size={isMobile ? "lg" : "sm"}
      onClick={onItemClick}
      className={`
  flex items-center gap-1 lg:gap-2
  text-sm lg:text-base text-foreground
  hover:text-blue-600 dark:hover:text-blue-400
  hover:bg-blue-100 dark:hover:bg-blue-900/40
  ${isMobile ? "w-full h-12" : "px-2 lg:px-4"}
`}

    >
      <Link href={sellerDashboard} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
        {!isMobile && <Store className="w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />}
        <span className={`${isMobile ? "" : "hidden lg:inline"} font-light`}>
          Sell For Free
        </span>
        {!isMobile && <span className="lg:hidden">Sell</span>}
      </Link>
    </Button>
  );
};

export default SellerButton;

