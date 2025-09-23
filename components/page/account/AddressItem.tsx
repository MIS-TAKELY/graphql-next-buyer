"use client";

import { useMutation } from "@apollo/client";
import { Edit2, MapPin, Phone, Star, Trash2 } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

import { DELETE_ADDRESS_BY_ID } from "@/client/address/address.mutations";
import { UpdateAddressForm } from "@/components/address";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BaseAddress,
  formatAddress,
  formatPhoneNumber,
  getAddressTypeColor,
} from "@/types/address";

interface AddressItemProps {
  address: BaseAddress;
  onSave?: (updatedAddress: BaseAddress) => void;
  onDelete?: (addressId: string) => void;
  disabled?: boolean;
}

const AddressItem = React.memo<AddressItemProps>(
  ({ address, onSave, onDelete, disabled = false }) => {
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Delete mutation
    const [deleteAddress, { loading: deleteLoading }] = useMutation(
      DELETE_ADDRESS_BY_ID,
      {
        onCompleted: () => {
          setShowDeleteDialog(false);
          onDelete?.(address.id!);
        },
        onError: (error) => {
          console.error("Failed to delete address:", error);
        },
      }
    );

    // Memoized values
    const addressTypeColor = useMemo(
      () => getAddressTypeColor(address.type),
      [address.type]
    );
    const formattedAddress = useMemo(() => formatAddress(address), [address]);
    const formattedPhone = useMemo(
      () => (address.phone ? formatPhoneNumber(address.phone) : ""),
      [address.phone]
    );

    // Event handlers
    const handleEdit = useCallback(() => {
      setShowEditDialog(true);
    }, []);

    const handleDelete = useCallback(() => {
      setShowDeleteDialog(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
      if (address.id) {
        await deleteAddress({ variables: { id: address.id } });
      }
    }, [address.id, deleteAddress]);

    const handleSave = useCallback(
      (updatedAddress: BaseAddress) => {
        setShowEditDialog(false);
        onSave?.(updatedAddress);
      },
      [onSave]
    );

    const handleCancelEdit = useCallback(() => {
      setShowEditDialog(false);
    }, []);

    const handleCancelDelete = useCallback(() => {
      setShowDeleteDialog(false);
    }, []);

    return (
      <>
        <Card className="border-2 transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: addressTypeColor }}
                />
                <span className="text-sm font-medium text-muted-foreground">
                  {address.label || address.type}
                </span>
                {address.isDefault && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
              </div>

              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  disabled={disabled}
                  className="h-8 w-8 p-0 hover:bg-blue-50"
                >
                  <Edit2 className="h-4 w-4 text-blue-600" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={disabled || address.isDefault}
                  className="h-8 w-8 p-0 hover:bg-red-50 disabled:hover:bg-transparent"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{formattedAddress}</p>
              </div>

              {address.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-gray-700">{formattedPhone}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog - Improved spacing and layout */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl">Edit Address</DialogTitle>
            </DialogHeader>

            <UpdateAddressForm
              address={address}
              onSave={handleSave}
              onCancel={handleCancelEdit}
              disabled={disabled}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Address</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this address? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={handleCancelDelete}
                disabled={deleteLoading}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteLoading ? "Deleting..." : "Delete Address"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
);

AddressItem.displayName = "AddressItem";

export default AddressItem;