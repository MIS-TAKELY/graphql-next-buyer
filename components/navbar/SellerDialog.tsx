import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface SellerDialogProps {
  isMobile?: boolean;
}

const SellerDialog = ({ isMobile = false }: SellerDialogProps) => {
  const [sellerForm, setSellerForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const isFormValid = sellerForm.name && sellerForm.email && sellerForm.phone;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={isMobile ? "outline" : "outline"}
          className={`text-sm lg:text-base text-foreground hover:bg-secondary border-border ${
            isMobile ? "w-full h-12" : "px-2 lg:px-4"
          }`}
          size={isMobile ? "lg" : "sm"}
        >
          <span className={isMobile ? "" : "hidden lg:inline"}>
            Become a Seller
          </span>
          {!isMobile && <span className="lg:hidden">Sell</span>}
        </Button>
      </DialogTrigger>
      <DialogContent
        className={`mx-4 ${
          isMobile ? "max-w-sm" : "max-w-md"
        } bg-popover border-border`}
      >
        <DialogHeader>
          <DialogTitle className="text-popover-foreground">
            Seller Registration
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Full Name"
            value={sellerForm.name}
            onChange={(e) =>
              setSellerForm((prev) => ({ ...prev, name: e.target.value }))
            }
            className="bg-input text-foreground border-border placeholder-muted-foreground"
          />
          <Input
            type="email"
            placeholder="Email Address"
            value={sellerForm.email}
            onChange={(e) =>
              setSellerForm((prev) => ({ ...prev, email: e.target.value }))
            }
            className="bg-input text-foreground border-border placeholder-muted-foreground"
          />
          <Input
            type="tel"
            placeholder="Phone Number"
            value={sellerForm.phone}
            onChange={(e) =>
              setSellerForm((prev) => ({ ...prev, phone: e.target.value }))
            }
            className="bg-input text-foreground border-border placeholder-muted-foreground"
          />
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary-hover"
            disabled={!isFormValid}
          >
            Submit Application
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SellerDialog;
