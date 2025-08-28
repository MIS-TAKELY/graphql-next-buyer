"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useCallback, useMemo, useRef } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateAddress } from "@/hooks/address/useAddressMutations";
import { useCreateAddressForm } from "@/hooks/address/useUnifiedAddressForm";
import { AddressFormData, BaseAddress } from "@/types/address";
import { AddressFieldGroup } from "./AddressFieldGroup";

// Error Boundary Component
class AddressFormErrorBoundary extends React.Component<
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
    console.error("AddressForm Error:", error, errorInfo);
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

interface AddAddressFormProps {
  onCancel?: () => void;
  onSave?: (result: BaseAddress) => void;
  onError?: (error: Error) => void;
  initialData?: Partial<AddressFormData>;
  disabled?: boolean;
  autoFocus?: boolean;
  fetchedFormData?: BaseAddress | BaseAddress[];
  context?: "profile" | "buy-now";
}

const AddAddressForm = React.memo<AddAddressFormProps>(function AddAddressForm({
  onCancel,
  onSave,
  onError,
  initialData,
  disabled = false,
  autoFocus = false,
  fetchedFormData,
  context,
}) {
  const path = usePathname();

  // Determine context if not explicitly provided
  const formContext = useMemo(() => {
    if (context) return context;
    return path === "/buy-now" ? "buy-now" : "profile";
  }, [context, path]);

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
  } = useCreateAddressForm(initialData, {
    validateOnChange: true,
    onValidationChange: useCallback(() => {}, []),
  });

  // Mutation hook
  const {
    submit,
    loading,
    error: mutationError,
    reset: resetMutation,
  } = useCreateAddress();

  // Refs
  const formRef = useRef<HTMLFormElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // Memoized values
  const defaultAddress = useMemo(() => {
    if (formContext === "buy-now" && fetchedFormData) {
      if (Array.isArray(fetchedFormData)) {
        return fetchedFormData.find((data) => data.isDefault === true);
      }
      return fetchedFormData?.isDefault ? fetchedFormData : undefined;
    }
    return undefined;
  }, [fetchedFormData, formContext]);

  const isBuyNowContext = useMemo(
    () => formContext === "buy-now",
    [formContext]
  );

  const canSubmit = useMemo(
    () => isValid && !loading && isDirty,
    [isValid, loading, isDirty]
  );

  const showSuccessState = useMemo(
    () => !loading && !mutationError && !hasErrors && !isDirty,
    [loading, mutationError, hasErrors, isDirty]
  );

  // Event handlers
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

        // For buy-now context, always set as default address
        if (isBuyNowContext) {
          submissionData.isDefault = true;
        }

        const result = await submit(submissionData as AddressFormData);
        console.log("Address created successfully:", result);

        if (onSave) {
          onSave(result);
        } else {
          reset();
        }
      } catch (err) {
        const error = err as Error;
        console.error("Failed to save address:", error);
        onError?.(error);
      }
    },
    [
      validateFullForm,
      focusError,
      getSubmissionData,
      submit,
      onSave,
      onError,
      reset,
      isBuyNowContext,
    ]
  );

  const handleCancel = useCallback(() => {
    reset();
    resetMutation();
    onCancel?.();
  }, [reset, resetMutation, onCancel]);

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

  // Determine if form should be disabled
  const isFormDisabled = useMemo(() => {
    if (disabled || loading) return true;
    // if (defaultAddress) return true;
    return false;
  }, [disabled, loading, formContext, defaultAddress]);

  // Determine button text
  const buttonText = useMemo(() => {
    if (loading) return "Saving...";
    if (formContext === "buy-now") return "Continue";
    return "Save Address";
  }, [loading, formContext]);

  // Show different UI based on context
  if (formContext === "buy-now" && defaultAddress) {
    // This case is now handled in the parent component
    // Just show the form for adding a new address
  }

  return (
    <AddressFormErrorBoundary onError={onError}>
      <Card className="border-2 mb-4 transition-all duration-200 hover:shadow-md">
        <CardContent className="p-4">
          {formContext === "buy-now" && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-1">
                {defaultAddress
                  ? "Add New Address"
                  : "Shipping Address Required"}
              </h3>
              <p className="text-xs text-blue-700">
                {defaultAddress
                  ? "Add a new address for this order"
                  : "Please provide your shipping address to continue"}
              </p>
            </div>
          )}

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
              disabled={isFormDisabled}
              layout="grid"
              showTypeField={true}
              showDefaultCheckbox={formContext === "profile"} // Only show checkbox in profile context
              className="mb-4"
            />

            {mutationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to save address: {mutationError.message}
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
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {buttonText}
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
    </AddressFormErrorBoundary>
  );
});

AddAddressForm.displayName = "AddAddressForm";

export default AddAddressForm;
