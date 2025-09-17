// "use client";
// import { ADD_TO_CART, REMOVE_FROM_CART } from "@/client/cart/cart.mutations";
// import { GET_CART_PRODUCT_IDS } from "@/client/cart/cart.queries";
// import { useMutation, useQuery } from "@apollo/client";
// import { useAuth } from "@clerk/nextjs";
// import { useCallback, useEffect, useMemo, useState } from "react";

// interface CartItem {
//   productId: string;
//   variantId: string;
//   quantity: number;
// }

// export const useCart = () => {
//   // Local state for cart items (Map to store productId, variantId, quantity)
//   const [cartItems, setCartItems] = useState<Map<string, CartItem>>(new Map());
//   const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());
//   const [itemLoading, setItemLoading] = useState(false);
//   const { userId } = useAuth();

//   // Load cart from localStorage for non-authenticated users
//   useEffect(() => {
//     if (!userId) {
//       const localCart = localStorage.getItem("cart");
//       if (localCart) {
//         try {
//           const parsedCart = JSON.parse(localCart) as CartItem[];
//           const cartMap = new Map<string, CartItem>(
//             parsedCart
//               .filter((item) => item.productId && item.variantId)
//               .map((item) => [item.productId, item])
//           );
//           setCartItems(cartMap);
//         } catch (error) {
//           console.error("Failed to parse localStorage cart:", error);
//         }
//       }
//     }
//   }, [userId]);

//   // Save cart to localStorage for non-authenticated users
//   const saveToLocalStorage = useCallback((items: Map<string, CartItem>) => {
//     if (!userId) {
//       const cartArray = Array.from(items.values());
//       localStorage.setItem("cart", JSON.stringify(cartArray));
//     }
//   }, [userId]);

//   // Load cart items from server for authenticated users
//   const { data: myCartItemsIds, loading: cartLoading, refetch } = useQuery(
//     GET_CART_PRODUCT_IDS,
//     {
//       skip: !userId,
//       fetchPolicy: "cache-first",
//       errorPolicy: "all",
//       onCompleted: (data) => {
//         console.log("data-->", data);
//         if (data?.getMyCart) {
//           const serverItems = data.getMyCart.map((item: any) => {
//             const productId =
//               item.variant?.product?.id ||
//               item.productId ||
//               item.product?.id ||
//               null;
//             // Try variant.id, variant_id, or item.variantId
//             const variantId =
//               item.variant?.id ||
//               item.variant_id || // For Medusa.js or similar
//               item.variantId ||
//               null;
//             const quantity = item.quantity || 1;

//             // Debug first item
//             if (data.getMyCart.length > 0 && data.getMyCart.indexOf(item) === 0) {
//               console.log("Full first item:", JSON.stringify(item, null, 2));
//               console.log("Extracted - productId:", productId, "variantId:", variantId, "quantity:", quantity);
//             }

//             return {
//               productId,
//               variantId,
//               quantity,
//             };
//           });

//           // Relax filter for debugging; require only productId temporarily
//           const filteredItems = serverItems.filter(
//             (item: CartItem) => item.productId // && item.variantId
//           );
//           console.log("serverItems (before filter):", serverItems);
//           console.log("filteredItems:", filteredItems);

//           const cartMap = new Map<string, CartItem>(
//             filteredItems.map((item: CartItem) => [item.productId, item])
//           );
//           console.log("cartMap-->", cartMap);
//           setCartItems(cartMap);
//         }
//       },
//       onError: (error) => {
//         console.error("Failed to fetch cart from server:", error);
//       },
//     }
//   );

//   // Sync local cart to server when user logs in
//   const [addToCartMutation] = useMutation(ADD_TO_CART);
//   const syncLocalCartToServer = useCallback(async () => {
//     if (userId && cartItems.size > 0) {
//       try {
//         for (const item of cartItems.values()) {
//           await addToCartMutation({
//             variables: {
//               variantId: item.variantId,
//               productId: item.productId,
//               quantity: item.quantity,
//             },
//             update: (cache, { data }) => {
//               cache.writeQuery({
//                 query: GET_CART_PRODUCT_IDS,
//                 data: { getMyCart: data?.addToCart || [] },
//               });
//             },
//           });
//         }
//         localStorage.removeItem("cart");
//         setCartItems(new Map());
//         await refetch();
//       } catch (error) {
//         console.error("Failed to sync cart to server:", error);
//       }
//     }
//   }, [userId, cartItems, addToCartMutation, refetch]);

//   // Trigger sync when user logs in
//   useEffect(() => {
//     if (userId) {
//       syncLocalCartToServer();
//     }
//   }, [userId, syncLocalCartToServer]);

//   // Compute serverCartItems for compatibility
//   const serverCartItems = useMemo<Set<string>>(() => {
//     if (!userId || !myCartItemsIds?.getMyCart) return new Set();
//     const ids = myCartItemsIds.getMyCart
//       .map((item: any) => {
//         const productId =
//           item.variant?.product?.id ||
//           item.productId ||
//           item.product?.id ||
//           null;
//         const variantId =
//           item.variant?.id ||
//           item.variant_id ||
//           item.variantId ||
//           null;

//         if (!productId) {
//           console.warn("Missing productId in serverCartItems for item:", item);
//         }

//         return productId;
//       })
//       .filter(Boolean);
//     const result = new Set(ids);
//     console.log("serverCartItems computed:", Array.from(result));
//     return result;
//   }, [userId, myCartItemsIds?.getMyCart]);

//   // Add to cart
//   const addToCart = useCallback(
//     async (variantId: string, productId: string, quantity: number = 1) => {
//       if (!productId || !variantId) {
//         console.error("Invalid productId or variantId");
//         return;
//       }
//       setItemLoading(true);
//       setPendingOperations((prev) => new Set([...prev, productId]));

//       // Optimistic update
//       setCartItems((prev) => {
//         const newCart = new Map(prev);
//         newCart.set(productId, { productId, variantId, quantity });
//         saveToLocalStorage(newCart);
//         return newCart;
//       });

//       if (userId) {
//         try {
//           await addToCartMutation({
//             variables: { variantId, productId, quantity },
//             update: (cache, { data }) => {
//               cache.writeQuery({
//                 query: GET_CART_PRODUCT_IDS,
//                 data: { getMyCart: data?.addToCart || [] },
//               });
//             },
//             onCompleted: () => {
//               setPendingOperations((prev) => {
//                 const newSet = new Set(prev);
//                 newSet.delete(productId);
//                 return newSet;
//               });
//             },
//             onError: () => {
//               console.error("Add to cart error");
//               setCartItems((prev) => {
//                 const newCart = new Map(prev);
//                 newCart.delete(productId);
//                 saveToLocalStorage(newCart);
//                 return newCart;
//               });
//               setPendingOperations((prev) => {
//                 const newSet = new Set(prev);
//                 newSet.delete(productId);
//                 return newSet;
//               });
//             },
//           });
//         } catch (error) {
//           console.error("Add to cart mutation failed", error);
//         }
//       } else {
//         setPendingOperations((prev) => {
//           const newSet = new Set(prev);
//           newSet.delete(productId);
//           return newSet;
//         });
//       }
//       setItemLoading(false);
//     },
//     [userId, addToCartMutation, saveToLocalStorage]
//   );

//   // Remove from cart
//   const [removeFromCartMutation] = useMutation(REMOVE_FROM_CART);
//   const removeFromCart = useCallback(
//     async (variantId: string, productId: string) => {
//       if (!productId || !variantId) {
//         console.error("Invalid productId or variantId");
//         return;
//       }
//       setItemLoading(true);
//       setPendingOperations((prev) => new Set([...prev, productId]));

//       // Optimistic update
//       setCartItems((prev) => {
//         const newCart = new Map(prev);
//         newCart.delete(productId);
//         saveToLocalStorage(newCart);
//         return newCart;
//       });

//       if (userId) {
//         try {
//           await removeFromCartMutation({
//             variables: { variantId, productId },
//             update: (cache, { data }) => {
//               cache.writeQuery({
//                 query: GET_CART_PRODUCT_IDS,
//                 data: { getMyCart: data?.removeFromCart || [] },
//               });
//             },
//             onCompleted: () => {
//               setPendingOperations((prev) => {
//                 const newSet = new Set(prev);
//                 newSet.delete(productId);
//                 return newSet;
//               });
//             },
//             onError: () => {
//               console.error("Remove from cart error");
//               setCartItems((prev) => {
//                 const newCart = new Map(prev);
//                 newCart.set(productId, { productId, variantId, quantity: 1 });
//                 saveToLocalStorage(newCart);
//                 return newCart;
//               });
//               setPendingOperations((prev) => {
//                 const newSet = new Set(prev);
//                 newSet.delete(productId);
//                 return newSet;
//               });
//             },
//           });
//         } catch (error) {
//           console.error("Remove from cart mutation failed", error);
//         }
//       } else {
//         setPendingOperations((prev) => {
//           const newSet = new Set(prev);
//           newSet.delete(productId);
//           return newSet;
//         });
//       }
//       setItemLoading(false);
//     },
//     [userId, removeFromCartMutation, saveToLocalStorage]
//   );

//   return {
//     cartItems,
//     serverCartItems,
//     cartLoading,
//     addToCart,
//     removeFromCart,
//     adding: pendingOperations.size > 0,
//     removing: pendingOperations.size > 0,
//     pendingOperations,
//     itemLoading,
//   };
// };