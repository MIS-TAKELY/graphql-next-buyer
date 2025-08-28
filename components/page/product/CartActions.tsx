import { Button } from "@/components/ui/button";
import { ReactElement } from "react";

type CartStatus =
  | "idle"
  | "adding"
  | "removing"
  | "added"
  | "removed"
  | "error";

interface CartActionsProps {
  productCartData: {
    isInCart: boolean;
    isDisabled: boolean;
  };
  status: CartStatus;
  isHovered: boolean;
  setIsHovered: (hovered: boolean) => void;
  handleAdd: (e: React.MouseEvent) => void;
  handleRemove: (e: React.MouseEvent) => void;
  buttonContent: {
    text: string;
    icon: ReactElement;
  };
}

export default function CartActions({
  productCartData,
  status,
  isHovered,
  setIsHovered,
  handleAdd,
  handleRemove,
  buttonContent,
}: CartActionsProps) {
  return (
    <Button
      size="lg"
      variant={productCartData.isInCart ? "outline" : "default"}
      onClick={productCartData.isInCart ? handleRemove : handleAdd}
      disabled={productCartData.isDisabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex-1 transition-all duration-200 transform active:scale-95 ${
        productCartData.isInCart
          ? "border-gray-500 text-gray-600 hover:bg-red-50 hover:border-red-500 hover:text-red-600"
          : "bg-white hover:bg-gray-200 text-black"
      } ${status === "added" ? "bg-gray-500 hover:bg-gray-600" : ""} ${
        status === "removed" ? "bg-gray-500 hover:bg-gray-600" : ""
      } ${status === "error" ? "bg-red-500 hover:bg-red-600" : ""}`}
    >
      <span className="flex items-center justify-center gap-2">
        {buttonContent.icon}
        <span className="transition-all duration-200">
          {buttonContent.text}
        </span>
      </span>
    </Button>
  );
}
