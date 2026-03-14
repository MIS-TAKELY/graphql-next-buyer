"use client"
import { useQuery } from "@apollo/client";
import { AlertCircle, MapPin, Plus } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

import { GET_ADDRESS_OF_USER } from "@/client/address/address.queries";
import { AddAddressForm } from "@/components/address";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BaseAddress } from "@/types/address";
import AddressItem from "./AddressItem";

// Skeleton component for loading state
const AddressItemSkeleton = React.memo(() => (
  <Card className="border-2">
    <CardContent className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </CardContent>
  </Card>
));

AddressItemSkeleton.displayName = "AddressItemSkeleton";

interface AddressesSectionProps {
  setAddresses?: (addresses: BaseAddress[]) => void;
}

const AddressesSection = React.memo<AddressesSectionProps>(() => {
  const [showAddForm, setShowAddForm] = useState(false);

  // Query addresses
  const { data, loading, error, refetch } = useQuery(GET_ADDRESS_OF_USER);

  // Get addresses from data
  const addresses = useMemo(() => data?.getAddressOfUser || [], [data]);

  // Memoized values
  const sortedAddresses = useMemo(() => {
    return [...addresses].sort((a: BaseAddress, b: BaseAddress) => {
      // Default addresses first
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      // Then by creation date (newest first)
      return (
        new Date(b.createdAt || "").getTime() -
        new Date(a.createdAt || "").getTime()
      );
    });
  }, [addresses]);

  const hasAddresses = useMemo(() => addresses.length > 0, [addresses]);
  const defaultAddress = useMemo(
    () => addresses.find((addr) => addr.isDefault),
    [addresses]
  );

  // Event handlers
  const handleAddAddress = useCallback(
    () => {
      setShowAddForm(false);
      refetch();
    },
    [refetch]
  );

  const handleUpdateAddress = useCallback(
    () => {
      refetch();
    },
    [refetch]
  );

  const handleDeleteAddress = useCallback(
    () => {
      refetch();
    },
    [refetch]
  );

  const handleShowAddForm = useCallback(() => {
    setShowAddForm(true);
  }, []);

  const handleHideAddForm = useCallback(() => {
    setShowAddForm(false);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Addresses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AddressItemSkeleton />
              <AddressItemSkeleton />
              <AddressItemSkeleton />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load addresses. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Addresses
              {hasAddresses && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({addresses.length})
                </span>
              )}
            </CardTitle>

            <Button
              onClick={handleShowAddForm}
              disabled={showAddForm}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Address
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Add Address Form */}
      {showAddForm && (
        <AddAddressForm
          context="profile"
          onSave={handleAddAddress}
          onCancel={handleHideAddForm}
          fetchedFormData={defaultAddress}
        />
      )}

      {/* Addresses List */}
      {hasAddresses ? (
        <div className="space-y-4">
          {sortedAddresses.map((address) => (
            <AddressItem
              key={address.id}
              address={address}
              onSave={handleUpdateAddress}
              onDelete={handleDeleteAddress}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No addresses yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first address to get started with faster checkout.
            </p>
            <Button onClick={handleShowAddForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Address
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

AddressesSection.displayName = "AddressesSection";

export default AddressesSection;
