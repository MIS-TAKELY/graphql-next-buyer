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
    <div className="md:hidden border-t border-border py-3 bg-card">
      <div className="space-y-2 px-2">
        {/* Cart as first item in mobile menu */}
        <div onClick={onClose}>
          <CartButton isMobile />
        </div>
        <UserDropdown isMobile />
        <SellerDialog isMobile />
      </div>
    </div>
  );
};

export default MobileMenu;