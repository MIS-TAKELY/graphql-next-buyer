import SearchBar from "./SearchBar";
import SellerDialog from "./SellerDialog";
import UserDropdown from "./UserDropdown";

interface MobileMenuProps {
  isOpen: boolean;
}

const MobileMenu = ({ isOpen }: MobileMenuProps) => {
  if (!isOpen) return null;

  return (
    <div className="sm:hidden border-t border-border py-4 bg-card">
      <div className="space-y-4">
        <SearchBar placeholder="Search products..." />
        <div className="space-y-3">
          <UserDropdown isMobile />
          <SellerDialog isMobile />
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
