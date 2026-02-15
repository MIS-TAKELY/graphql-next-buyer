import {
  AddressFormData,
  AddressValidationErrors,
  isFormValid,
  validateAddressForm,
  validateField,
} from "@/types/address";
import { useCallback, useMemo } from "react";
import { addressSchema } from "@/lib/schemas/address";

interface UseAddressValidationOptions {
  validateOnChange?: boolean;
  debounceMs?: number;
}

export const useAddressValidation = (
  options: UseAddressValidationOptions = {}
) => {
  const { validateOnChange = true } = options;

  // Memoized validation functions to prevent re-creation on every render
  const validateSingleField = useCallback(
    (field: keyof AddressFormData, value: any) => {
      // Check if the field exists in the schema shape
      // We cast to any because Zod's .shape might not strictly match all keys of AddressFormData
      const shape = addressSchema.shape as any;
      const fieldSchema = shape[field];

      // If no schema defined for this field (e.g. userId), skip validation
      if (!fieldSchema) return null;

      const result = fieldSchema.safeParse(value);
      if (!result.success) {
        return result.error.errors[0]?.message || "Invalid value";
      }
      return null;
    },
    []
  );

  const validateForm = useCallback((formData: Partial<AddressFormData>) => {
    // safeParse will strip unknown keys if not passthrough, but we used passthrough or just want errors for known ones
    const result = addressSchema.safeParse(formData);
    if (!result.success) {
      const errors: AddressValidationErrors = {};
      result.error.issues.forEach((issue) => {
        // issue.path[0] is the field name
        if (issue.path[0]) {
          errors[issue.path[0] as keyof AddressFormData] = issue.message;
        }
      });
      return errors;
    }
    return {};
  }, []);

  const checkIsValid = useCallback((errors: AddressValidationErrors) => {
    return isFormValid(errors); // keeping existing helper if correct, or Object.keys(errors).length === 0
  }, []);

  // Memoized validation helper that focuses on first error
  const getFirstError = useCallback((errors: AddressValidationErrors) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) return null;

    const firstKey = errorKeys[0] as keyof AddressFormData;
    return {
      field: firstKey,
      message: errors[firstKey],
    };
  }, []);

  // Focus on first error field helper
  const focusFirstError = useCallback(
    (errors: AddressValidationErrors) => {
      const firstError = getFirstError(errors);
      if (firstError) {
        const element = document.querySelector(
          `[name="${firstError.field}"]`
        ) as HTMLElement;
        element?.focus();
        return firstError;
      }
      return null;
    },
    [getFirstError]
  );

  // Validate with context-specific rules
  const validateWithContext = useCallback(
    (
      formData: Partial<AddressFormData>,
      context: "create" | "update" | "checkout" = "create"
    ) => {
      const errors = validateForm(formData);

      // Context-specific validation adjustments
      if (context === "checkout") {
        // For checkout, we might require phoneNumber for shipping
        if (formData.type === "SHIPPING" && !formData.phoneNumber?.trim()) {
          errors.phoneNumber = "Phone number is required for shipping address";
        }
      }

      return errors;
    },
    [validateForm]
  );

  // Batch validation for multiple fields
  const validateFields = useCallback(
    (fields: Array<{ field: keyof AddressFormData; value: any }>) => {
      const errors: AddressValidationErrors = {};

      fields.forEach(({ field, value }) => {
        const error = validateSingleField(field as any, value);
        if (error) {
          errors[field] = error;
        }
      });

      return errors;
    },
    [validateSingleField]
  );

  return {
    validateSingleField,
    validateForm,
    validateWithContext,
    validateFields,
    checkIsValid,
    getFirstError,
    focusFirstError,
  };
};

// Hook for real-time validation with debouncing
export const useRealtimeValidation = (
  formData: Partial<AddressFormData>,
  debounceMs: number = 300
) => {
  const { validateForm, checkIsValid } = useAddressValidation();

  // Memoized validation results to prevent unnecessary re-validation
  const validationResult = useMemo(() => {
    const errors = validateForm(formData);
    return {
      errors,
      isValid: checkIsValid(errors),
      hasErrors: Object.keys(errors).length > 0,
    };
  }, [formData, validateForm, checkIsValid]);

  return validationResult;
};

// Hook for field-level validation
export const useFieldValidation = () => {
  const { validateSingleField } = useAddressValidation();

  const createFieldValidator = useCallback(
    (field: keyof AddressFormData) => {
      return (value: any) => validateSingleField(field, value);
    },
    [validateSingleField]
  );

  return { createFieldValidator };
};
