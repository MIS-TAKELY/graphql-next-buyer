// components/page/buy-now/AddressStep.tsx
import { AddAddressForm } from "@/components/address";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, MapPin, Plus, Truck } from "lucide-react";
import { useState } from "react";

interface AddressStepProps {
  selectedAddress: any;
  showAddressForm: boolean;
  addresses: any[];
  onAddressSaved: (address: any) => void;
  onCancelAddressForm: () => void;
  onUseDefaultAddress: () => void;
  onSelectAddress: (address: any) => void;
}

export function AddressStep({
  selectedAddress,
  showAddressForm,
  addresses,
  onAddressSaved,
  onCancelAddressForm,
  onUseDefaultAddress,
  onSelectAddress,
}: AddressStepProps) {
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isCreatingDefault, setIsCreatingDefault] = useState(false);

  // If showing address form, render the form
  if (showAddressForm || showNewAddressForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {isCreatingDefault ? "Add Default Address" : "Add New Address"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isCreatingDefault
              ? "Create your default shipping address"
              : "Add a new address for this order"}
          </p>
        </CardHeader>
        <CardContent>
          <AddAddressForm
            context="buy-now"
            fetchedFormData={addresses}
            onSave={(newAddress) => {
              onAddressSaved(newAddress);
              setShowNewAddressForm(false);
              setIsCreatingDefault(false);
            }}
            onCancel={() => {
              setShowNewAddressForm(false);
              setIsCreatingDefault(false);
              onCancelAddressForm();
            }}
            initialData={
              isCreatingDefault ? { isDefault: true } : { isDefault: false }
            }
          />
        </CardContent>
      </Card>
    );
  }

  // If no addresses exist, show form to create default address
  if (addresses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Address Required
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Please provide your shipping address to continue
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800 mb-2">
                No Addresses Found
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                You don&apos;t have any saved addresses. Please create your
                first shipping address.
              </p>
            </div>
            <Button
              onClick={() => {
                setIsCreatingDefault(true);
                setShowNewAddressForm(true);
              }}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Default Address
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If addresses exist but none selected, show address selection
  if (!selectedAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Select Shipping Address
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose from your saved addresses or add a new one
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Address List */}
            <div className="space-y-3">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    address.isDefault
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => onSelectAddress(address)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {address.isDefault && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 text-xs"
                          >
                            Default
                          </Badge>
                        )}
                        {address.label && (
                          <Badge variant="outline" className="text-xs">
                            {address.label}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm space-y-1">
                        <p className="font-medium">{address.line1}</p>
                        {address.line2 && (
                          <p className="text-gray-600">{address.line2}</p>
                        )}
                        <p className="text-gray-600">
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p className="text-gray-600">{address.country}</p>
                        {address.phone && (
                          <p className="text-gray-600">📞 {address.phone}</p>
                        )}
                      </div>
                    </div>
                    {address.isDefault && (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Add New Address Button */}
            <Button
              onClick={() => setShowNewAddressForm(true)}
              variant="outline"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Address
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If address is selected, show confirmation with options
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Shipping Address Selected
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Review your selected address or make changes
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Selected Address Display */}
          <div
            className={`p-4 border rounded-lg ${
              selectedAddress.isDefault
                ? "border-green-300 bg-green-50"
                : "border-blue-300 bg-blue-50"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedAddress.isDefault
                  ? "Default Address"
                  : "Selected Address"}
              </h3>
              {selectedAddress.isDefault && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Default
                </Badge>
              )}
            </div>
            <div className="text-sm space-y-1">
              <p className="font-medium">{selectedAddress.line1}</p>
              {selectedAddress.line2 && (
                <p className="text-gray-600">{selectedAddress.line2}</p>
              )}
              <p className="text-gray-600">
                {selectedAddress.city}, {selectedAddress.state}{" "}
                {selectedAddress.postalCode}
              </p>
              <p className="text-gray-600">{selectedAddress.country}</p>
              {selectedAddress.phone && (
                <p className="text-gray-600">📞 {selectedAddress.phone}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowNewAddressForm(true)}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Different Address
            </Button>
            <Button
              onClick={onUseDefaultAddress}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Continue with This Address
            </Button>
          </div>

          {/* Change Selection Option */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancelAddressForm()}
              className="text-gray-600 hover:text-gray-800"
            >
              Choose Different Address
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
