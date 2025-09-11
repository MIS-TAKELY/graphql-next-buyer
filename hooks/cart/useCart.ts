"use client";
import { ADD_TO_CART, REMOVE_FROM_CART } from "@/client/cart/cart.mutations";
import { GET_CART_PRODUCT_IDS } from "@/client/cart/cart.queries";
import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo, useState } from "react";

// Define GraphQL response types (replace with your generated types if using @graphql-codegen)
interface CartItem {
  variant?: { product?: { id: string } | null } | null;
  productId?: string | null;
  product?: { id: string } | null;
}

interface GetCartQueryData {
  getMyCart: CartItem[];
}

interface CartMutationVariables {
  variantId: string;
  productId: string;
  quantity?: number;
}

interface CartMutationResponse {
  success: boolean;
  // Add other fields returned by your mutations if needed
}

export const useCart = () => {
  // State for optimistic cart items and pending operations
  const [optimisticCartItems, setOptimisticCartItems] = useState<Set<string>>(
    new Set()
  );
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(
    new Set()
  );

  // Fetch cart items from server
  const { data, loading: cartLoading } = useQuery<GetCartQueryData>(
    GET_CART_PRODUCT_IDS,
    {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
      onCompleted: (data) => {
        if (data?.getMyCart) {
          const serverIds = new Set<string>(
            data.getMyCart
              .map(
                (item) =>
                  item.variant?.product?.id ??
                  item.productId ??
                  item.product?.id
              )
              .filter((id): id is string => !!id)
          );
          setOptimisticCartItems(serverIds);
        }
      },
    }
  );

  // Add to cart mutation
  const [addToCartMutation, { loading: adding }] = useMutation<
    CartMutationResponse,
    CartMutationVariables
  >(ADD_TO_CART, {
    onCompleted: (data, { variables }) => {
      // Fixed: TypeScript now knows 'variables' exists because it's destructured from typed CartMutationVariables
      if (variables?.productId) {
        setPendingOperations((prev) => {
          const newSet = new Set(prev);
          newSet.delete(variables.productId);
          return newSet;
        });
      }
    },
    onError: (error, { variables }) => {
      // Fixed: Same as above
      console.error("Add to cart error:", error);
      if (variables?.productId) {
        setOptimisticCartItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(variables.productId);
          return newSet;
        });
        setPendingOperations((prev) => {
          const newSet = new Set(prev);
          newSet.delete(variables.productId);
          return newSet;
        });
      }
    },
  });

  // Remove from cart mutation
  const [removeFromCartMutation, { loading: removing }] = useMutation<
    CartMutationResponse,
    CartMutationVariables
  >(REMOVE_FROM_CART, {
    onCompleted: (data, { variables }) => {
      // Fixed: TypeScript now knows 'variables' exists
      if (variables?.productId) {
        setPendingOperations((prev) => {
          const newSet = new Set(prev);
          newSet.delete(variables.productId);
          return newSet;
        });
      }
    },
    onError: (error, { variables }) => {
      // Fixed: Same as above
      console.error("Remove from cart error:", error);
      if (variables?.productId) {
        setOptimisticCartItems((prev) => {
          const newSet = new Set(prev);
          newSet.add(variables.productId);
          return newSet;
        });
        setPendingOperations((prev) => {
          const newSet = new Set(prev);
          newSet.delete(variables.productId);
          return newSet;
        });
      }
    },
  });

  // Memoize server cart items
  const serverCartItems = useMemo<Set<string>>(() => {
    if (!data?.getMyCart) return new Set();
    const ids = data.getMyCart
      .map(
        (item) =>
          item.variant?.product?.id ?? item.productId ?? item.product?.id
      )
      .filter((id): id is string => !!id);

    return new Set(ids);
  }, [data?.getMyCart]);

  // Add to cart function
  const addToCart = useCallback(
    async (variantId: string, productId: string) => {
      if (!variantId || !productId) {
        console.error("Invalid variantId or productId");
        return Promise.resolve();
      }

      setOptimisticCartItems((prev) => {
        const newSet = new Set(prev);
        newSet.add(productId);
        return newSet;
      });

      setPendingOperations((prev) => {
        const newSet = new Set(prev);
        newSet.add(productId);
        return newSet;
      });

      // Fixed: Pass variables explicitly to onCompleted/onError via the mutate options
      await addToCartMutation({
        variables: { variantId, quantity: 1, productId },
        onCompleted: (data) => {
          // Optional: Handle completion here if needed (avoids options destructuring)
          console.log("Add to cart completed:", data);
        },
        onError: (error) => {
          // Optional: Handle error here if needed
          console.error("Add to cart failed:", error);
        },
      }).catch((error) => {
        console.error("Add to cart failed:", error);
      });

      return Promise.resolve();
    },
    [addToCartMutation]
  );

  // Remove from cart function
  const removeFromCart = useCallback(
    async (variantId: string, productId: string) => {
      if (!variantId || !productId) {
        console.error("Invalid variantId or productId");
        return Promise.resolve();
      }

      setOptimisticCartItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });

      setPendingOperations((prev) => {
        const newSet = new Set(prev);
        newSet.add(productId);
        return newSet;
      });

      // Fixed: Pass variables explicitly to onCompleted/onError via the mutate options
      await removeFromCartMutation({
        variables: { variantId, productId },
        onCompleted: (data) => {
          // Optional: Handle completion here if needed
          console.log("Remove from cart completed:", data);
        },
        onError: (error) => {
          // Optional: Handle error here if needed
          console.error("Remove from cart failed:", error);
        },
      }).catch((error) => {
        console.error("Remove from cart failed:", error);
      });

      return Promise.resolve();
    },
    [removeFromCartMutation]
  );

  return {
    cartItems: optimisticCartItems,
    serverCartItems,
    cartLoading,
    addToCart,
    adding: pendingOperations.size > 0,
    removeFromCart,
    removing: pendingOperations.size > 0,
    pendingOperations,
  };
};
