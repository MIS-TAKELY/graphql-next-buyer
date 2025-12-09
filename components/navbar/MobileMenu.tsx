import CartButton from "./CartButton";
import SellerDialog from "./SellerDialog";
import UserDropdown from "./UserDropdown";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden absolute top-16 left-0 w-full bg-background/95 backdrop-blur-3xl border-b border-border shadow-2xl animate-accordion-down origin-top z-40 pb-4">
      <div className="flex flex-col space-y-1 p-4">
        {/* Mobile styling for menu items */}
        <div className="space-y-4">
          {/* Cart (if not in header) or other mobile specifc items */}
          {/* Note: CartButton is already in header in my previous refactor, but keeping functionality if desired to double up or specific mobile logic */}

          <div className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
            <UserDropdown isMobile />
          </div>

          <div className="h-px bg-border/50 mx-2" />

          <div className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
            <SellerDialog isMobile />
          </div>
        </div>
      </div>

      {/* Overlay click to close */}
      <div
        className="fixed inset-0 top-16 -z-10 bg-black/20 backdrop-blur-[1px] h-[calc(100vh-4rem)]"
        onClick={onClose}
        aria-hidden="true"
      />
    </div>
  );
};

export default MobileMenu;