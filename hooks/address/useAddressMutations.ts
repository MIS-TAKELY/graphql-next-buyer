import {
  ADD_ADDRESS,
  UPDATE_ADDRESS,
} from "@/client/address/address.mutations";
import { GET_ADDRESS_OF_USER } from "@/client/address/address.queries";
import {
  AddressFormData,
  BaseAddress,
  UpdateAddressFormData,
} from "@/types/address";
import { useMutation } from "@apollo/client";
import { useCallback, useMemo } from "react";

interface MutationResult<T = any> {
  data?: T;
  error?: Error;
  success: boolean;
}

interface UseAddressMutationsReturn {
  // Create address
  createAddress: (
    data: AddressFormData
  ) => Promise<MutationResult<BaseAddress>>;
  isCreating: boolean;
  createError: Error | null;

  // Update address
  updateAddress: (
    data: UpdateAddressFormData
  ) => Promise<MutationResult<BaseAddress>>;
  isUpdating: boolean;
  updateError: Error | null;

  // Delete address (if mutation exists)
  deleteAddress?: (id: string) => Promise<MutationResult>;
  isDeleting?: boolean;
  deleteError?: Error | null;

  // Combined states
  isLoading: boolean;
  hasError: boolean;
  combinedError: Error | null;

  // Reset functions
  resetErrors: () => void;
  resetCreateError: () => void;
  resetUpdateError: () => void;
}

export const useAddressMutations = (): UseAddressMutationsReturn => {
  // Add Address Mutation
  const [
    addAddressMutation,
    { loading: isCreating, error: createError, reset: resetAddMutation },
  ] = useMutation(ADD_ADDRESS, {
    refetchQueries: [{ query: GET_ADDRESS_OF_USER }],
    awaitRefetchQueries: true,
    errorPolicy: "all",
  });

  // Update Address Mutation
  const [
    updateAddressMutation,
    { loading: isUpdating, error: updateError, reset: resetUpdateMutation },
  ] = useMutation(UPDATE_ADDRESS, {
    refetchQueries: [{ query: GET_ADDRESS_OF_USER }],
    awaitRefetchQueries: true,
    errorPolicy: "all",
  });

  // Create Address Function
  const createAddress = useCallback(
    async (data: AddressFormData): Promise<MutationResult<BaseAddress>> => {
      try {
        const result = await addAddressMutation({
          variables: { input: data },
          optimisticResponse: {
            addAddress: {
              __typename: "Address",
              id: `temp-${Date.now()}`,
              userId: "temp-user",
              ...data,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        });

        if (result.data?.addAddress) {
          // Backend returns boolean, so we return the form data as success response
          return {
            data: { ...data, id: `temp-${Date.now()}` } as BaseAddress,
            success: true,
          };
        } else {
          throw new Error("Failed to create address");
        }
      } catch (error) {
        console.error("Error creating address:", error);
        return {
          error: error as Error,
          success: false,
        };
      }
    },
    [addAddressMutation]
  );

  // Update Address Function
  const updateAddress = useCallback(
    async (
      data: UpdateAddressFormData
    ): Promise<MutationResult<BaseAddress>> => {
      try {
        const { id, ...updateData } = data;

        const result = await updateAddressMutation({
          variables: {
            input: { id, ...updateData },
          },
          optimisticResponse: {
            updateAddress: {
              __typename: "Address",
              id,
              userId: "temp-user",
              ...updateData,
              updatedAt: new Date().toISOString(),
            },
          },
        });

        if (result.data?.updateAddress) {
          // Backend returns boolean, so we return the form data as success response
          return {
            data: { ...data } as BaseAddress,
            success: true,
          };
        } else {
          throw new Error("Failed to update address");
        }
      } catch (error) {
        console.error("Error updating address:", error);
        return {
          error: error as Error,
          success: false,
        };
      }
    },
    [updateAddressMutation]
  );

  // Combined loading state
  const isLoading = useMemo(() => {
    return isCreating || isUpdating;
  }, [isCreating, isUpdating]);

  // Combined error state
  const hasError = useMemo(() => {
    return !!(createError || updateError);
  }, [createError, updateError]);

  // Combined error (prioritize the most recent one)
  const combinedError = useMemo(() => {
    return updateError || createError || null;
  }, [createError, updateError]);

  // Reset functions
  const resetErrors = useCallback(() => {
    resetAddMutation();
    resetUpdateMutation();
  }, [resetAddMutation, resetUpdateMutation]);

  const resetCreateError = useCallback(() => {
    resetAddMutation();
  }, [resetAddMutation]);

  const resetUpdateError = useCallback(() => {
    resetUpdateMutation();
  }, [resetUpdateMutation]);

  return {
    // Create address
    createAddress,
    isCreating,
    createError: (createError as unknown as Error) ?? null,

    // Update address
    updateAddress,
    isUpdating,
    updateError: (updateError as unknown as Error) ?? null,

    // Combined states
    isLoading,
    hasError,
    combinedError: (combinedError as unknown as Error) ?? null,

    // Reset functions
    resetErrors,
    resetCreateError,
    resetUpdateError,
  };
};

// Specialized hooks for specific operations
export const useCreateAddress = () => {
  const {
    createAddress,
    isCreating: loading,
    createError: error,
    resetCreateError: reset,
  } = useAddressMutations();

  const submit = useCallback(
    async (data: AddressFormData): Promise<BaseAddress> => {
      const result = await createAddress(data);
      if (!result.success && result.error) {
        throw result.error;
      }
      return result.data as BaseAddress;
    },
    [createAddress]
  );

  return {
    submit,
    loading,
    error,
    reset,
  };
};

export const useUpdateAddress = () => {
  const {
    updateAddress,
    isUpdating: loading,
    updateError: error,
    resetUpdateError: reset,
  } = useAddressMutations();

  const submit = useCallback(
    async (data: UpdateAddressFormData): Promise<BaseAddress> => {
      const result = await updateAddress(data);
      if (!result.success && result.error) {
        throw result.error;
      }
      return result.data as BaseAddress;
    },
    [updateAddress]
  );

  return {
    submit,
    loading,
    error,
    reset,
  };
};

// Batch operations hook (for future use)
export const useBatchAddressOperations = () => {
  const { createAddress, updateAddress, isLoading } = useAddressMutations();

  const batchCreate = useCallback(
    async (addresses: AddressFormData[]) => {
      const results = await Promise.allSettled(
        addresses.map((address) => createAddress(address))
      );

      const successful = results
        .filter(
          (
            result
          ): result is PromiseFulfilledResult<MutationResult<BaseAddress>> =>
            result.status === "fulfilled" && result.value.success
        )
        .map((result) => result.value.data);

      const failed = results.filter(
        (
          result
        ): result is
          | PromiseRejectedResult
          | PromiseFulfilledResult<MutationResult<BaseAddress>> =>
          result.status === "rejected" ||
          (result.status === "fulfilled" && !result.value.success)
      );

      return {
        successful,
        failed: failed.length,
        total: addresses.length,
      };
    },
    [createAddress]
  );

  const batchUpdate = useCallback(
    async (addresses: UpdateAddressFormData[]) => {
      const results = await Promise.allSettled(
        addresses.map((address) => updateAddress(address))
      );

      const successful = results
        .filter(
          (
            result
          ): result is PromiseFulfilledResult<MutationResult<BaseAddress>> =>
            result.status === "fulfilled" && result.value.success
        )
        .map((result) => result.value.data);

      const failed = results.filter(
        (
          result
        ): result is
          | PromiseRejectedResult
          | PromiseFulfilledResult<MutationResult<BaseAddress>> =>
          result.status === "rejected" ||
          (result.status === "fulfilled" && !result.value.success)
      );

      return {
        successful,
        failed: failed.length,
        total: addresses.length,
      };
    },
    [updateAddress]
  );

  return {
    batchCreate,
    batchUpdate,
    isLoading,
  };
};
