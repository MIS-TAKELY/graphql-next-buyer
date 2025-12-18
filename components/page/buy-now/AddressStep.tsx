// components/page/buy-now/AddressStep.tsx
import { AddAddressForm } from "@/components/address";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

  if (showAddressForm || showNewAddressForm) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Truck className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            {isCreatingDefault ? "Add Default Address" : "Add New Address"}
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
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

  if (addresses.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Truck className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            Shipping Address Required
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Please provide your shipping address to continue
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">
                No Addresses Found
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                You don&apos;t have any saved addresses. Please create your first shipping address.
              </p>
            </div>
            <Button
              onClick={() => {
                setIsCreatingDefault(true);
                setShowNewAddressForm(true);
              }}
              className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Plus className="w-4 h-4 mr-2 text-gray-900 dark:text-white" />
              Create Default Address
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedAddress) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Truck className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            Select Shipping Address
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Choose from your saved addresses or add a new one
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${address.isDefault
                      ? "border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600"
                    }`}
                  onClick={() => onSelectAddress(address)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        {address.isDefault && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 dark:bg-green-700 text-green-800 dark:text-green-300 text-xs"
                          >
                            Default
                          </Badge>
                        )}
                        {address.label && (
                          <Badge
                            variant="outline"
                            className="text-xs border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                          >
                            {address.label}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm space-y-1">
                        <p className="font-medium text-gray-900 dark:text-white">{address.line1}</p>
                        {address.line2 && (
                          <p className="text-gray-600 dark:text-gray-300">{address.line2}</p>
                        )}
                        <p className="text-gray-600 dark:text-gray-300">
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">{address.country}</p>
                        {address.phone && (
                          <p className="text-gray-600 dark:text-gray-300">📞 {address.phone}</p>
                        )}
                      </div>
                    </div>
                    {address.isDefault && (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Separator className="bg-gray-200 dark:bg-gray-600" />
            <Button
              onClick={() => setShowNewAddressForm(true)}
              variant="outline"
              className="w-full border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Plus className="w-4 h-4 mr-2 text-gray-900 dark:text-white" />
              Add New Address
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Truck className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          Shipping Address Selected
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Review your selected address or make changes
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div
            className={`p-4 border rounded-lg ${selectedAddress.isDefault
                ? "border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
                : "border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20"
              }`}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedAddress.isDefault
                  ? "Default Address"
                  : "Selected Address"}
              </h3>
              {selectedAddress.isDefault && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 dark:bg-green-700 text-green-800 dark:text-green-300"
                >
                  Default
                </Badge>
              )}
            </div>
            <div className="text-sm space-y-1">
              <p className="font-medium text-gray-900 dark:text-white">{selectedAddress.line1}</p>
              {selectedAddress.line2 && (
                <p className="text-gray-600 dark:text-gray-300">{selectedAddress.line2}</p>
              )}
              <p className="text-gray-600 dark:text-gray-300">
                {selectedAddress.city}, {selectedAddress.state}{" "}
                {selectedAddress.postalCode}
              </p>
              <p className="text-gray-600 dark:text-gray-300">{selectedAddress.country}</p>
              {selectedAddress.phone && (
                <p className="text-gray-600 dark:text-gray-300">📞 {selectedAddress.phone}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowNewAddressForm(true)}
              className="w-full sm:flex-1 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Plus className="w-4 h-4 mr-2 text-gray-900 dark:text-white" />
              Add Different Address
            </Button>
            <Button
              onClick={onUseDefaultAddress}
              className="w-full sm:flex-1 bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-400"
            >
              <CheckCircle className="w-4 h-4 mr-2 text-white" />
              Continue with This Address
            </Button>
          </div>
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancelAddressForm()}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              Choose Different Address
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}