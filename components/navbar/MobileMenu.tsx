// MobileMenu.tsx
import SellerDialog from "./SellerDialog";
import UserDropdown from "./UserDropdown";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="top"
        className="w-full p-0 border-b border-border/30 shadow-2xl backdrop-blur-xl bg-background/98"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>

        <div className="max-h-[85vh] overflow-y-auto mt-12">
          <div className="p-4 space-y-6">
            {/* User Account Section */}
            <div className="space-y-1">
              <UserDropdown isMobile onItemClick={onClose} />
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  For Sellers
                </span>
              </div>
            </div>

            {/* Seller Section */}
            <div className="pb-6">
              <SellerDialog isMobile onItemClick={onClose} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;