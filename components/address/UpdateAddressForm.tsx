"use client";

import { AlertCircle, CheckCircle, Loader2, Save } from "lucide-react";
import React, { useCallback, useMemo, useRef, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdateAddress } from "@/hooks/address/useAddressMutations";
import { useUpdateAddressForm } from "@/hooks/address/useUnifiedAddressForm";
import { BaseAddress } from "@/types/address";
import { AddressFieldGroup } from "./AddressFieldGroup";

// Error Boundary Component
class UpdateAddressFormErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("UpdateAddressForm Error:", error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Something went wrong with the address form. Please refresh and try
            again.
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

interface UpdateAddressFormProps {
  address: BaseAddress;
  onSave?: (updatedAddress: BaseAddress) => void;
  onCancel?: () => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
}

const UpdateAddressForm = React.memo<UpdateAddressFormProps>(
  ({ address, onSave, onCancel, onError, disabled = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form hook
    const {
      formData,
      errors,
      isValid,
      isDirty,
      hasErrors,
      handleFieldChange,
      validateFullForm,
      reset,
      focusError,
      getSubmissionData,
    } = useUpdateAddressForm(
      { id: (address as any).id ?? "", ...(address as any) },
      {
        validateOnChange: true,
      }
    );

    // Mutation hook
    const {
      submit,
      loading,
      error: mutationError,
      reset: resetMutation,
    } = useUpdateAddress();

    // Refs
    const formRef = useRef<HTMLFormElement>(null);
    const submitButtonRef = useRef<HTMLButtonElement>(null);

    // Memoized values
    const canSubmit = useMemo(
      () => isValid && !loading && isDirty,
      [isValid, loading, isDirty]
    );

    const showSuccessState = useMemo(
      () => !loading && !mutationError && !hasErrors && !isDirty && isSuccess,
      [loading, mutationError, hasErrors, isDirty, isSuccess]
    );

    // Event handlers
    const handleEdit = useCallback(() => {
      setIsEditing(true);
      setIsSuccess(false);
    }, []);

    const handleCancel = useCallback(() => {
      setIsEditing(false);
      setIsSuccess(false);
      reset();
      resetMutation();
      onCancel?.();
    }, [reset, resetMutation, onCancel]);

    const handleSubmit = useCallback(
      async (e?: React.FormEvent) => {
        e?.preventDefault();
        const { isValid } = validateFullForm();
        if (!isValid) {
          focusError();
          return;
        }

        try {
          const submissionData = getSubmissionData();
          const result = await submit(submissionData as any);
          console.log("Address updated successfully:", result);

          setIsSuccess(true);
          setIsEditing(false);

          if (onSave) {
            onSave(result);
          }

          // Reset success state after delay
          setTimeout(() => setIsSuccess(false), 3000);
        } catch (err) {
          const error = err as Error;
          console.error("Failed to update address:", error);
          onError?.(error);
        }
      },
      [validateFullForm, focusError, getSubmissionData, submit, onSave, onError]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          handleSubmit();
        } else if (e.key === "Escape") {
          e.preventDefault();
          handleCancel();
        }
      },
      [handleSubmit, handleCancel]
    );

    if (!isEditing) {
      return (
        <Card className="border-2 transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {address.isDefault && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <span className="text-sm font-medium text-muted-foreground">
                  {address.label || address.type}
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEdit}
                disabled={disabled}
                className="min-w-[60px]"
              >
                Edit
              </Button>
            </div>

            <AddressFieldGroup
              formData={address}
              errors={{}}
              onFieldChange={() => {}}
              disabled={true}
              layout="vertical"
              showTypeField={false}
              showDefaultCheckbox={false}
            />
          </CardContent>
        </Card>
      );
    }

    return (
      <UpdateAddressFormErrorBoundary onError={onError}>
        <Card className="border-2 border-blue-200 bg-blue-50/50 transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Save className="h-5 w-5 text-blue-600" />
              Edit Address
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4">
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
              className="space-y-4"
              noValidate
            >
              <AddressFieldGroup
                formData={formData}
                errors={errors}
                onFieldChange={handleFieldChange}
                disabled={disabled || loading}
                layout="grid"
                showTypeField={true}
                showDefaultCheckbox={true}
                className="mb-4"
              />

              {mutationError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to update address: {mutationError.message}
                  </AlertDescription>
                </Alert>
              )}

              {showSuccessState && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Address updated successfully!
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {isDirty ? (
                    <span className="text-orange-600">Unsaved changes</span>
                  ) : (
                    !showSuccessState && <span>Ready to save</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                    className="min-w-[80px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    ref={submitButtonRef}
                    type="submit"
                    disabled={!canSubmit || disabled}
                    className="min-w-[120px] relative"
                  >
                    {loading && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground text-center pt-2 border-t border-dashed">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">
                  Ctrl+Enter
                </kbd>{" "}
                to save,
                <kbd className="px-2 py-1 bg-muted rounded text-xs ml-1">
                  Esc
                </kbd>{" "}
                to cancel
              </div>
            </form>
          </CardContent>
        </Card>
      </UpdateAddressFormErrorBoundary>
    );
  }
);

UpdateAddressForm.displayName = "UpdateAddressForm";

export default UpdateAddressForm;
