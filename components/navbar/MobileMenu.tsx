// MobileMenu.tsx
import SellerDialog from "./SellerDialog";
import UserDropdown from "./UserDropdown";
import { useEffect } from "react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Fixed positioning to cover entire viewport */}
      <div
        className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
        style={{ top: '3.5rem' }} // Start below navbar
      />

      {/* Menu Panel */}
      <div 
        className="md:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-border/30 shadow-2xl z-50 animate-in slide-in-from-top-2 duration-300"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside menu from closing it
      >
        <div className="max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* User Account Section */}
            <div className="space-y-1">
              <UserDropdown isMobile />
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
            <div className="pb-2">
              <SellerDialog isMobile />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;