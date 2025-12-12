import { z } from "zod";

export const addToCartSchema = z.object({
    productId: z.string().min(1, { message: "Product ID is required" }),
    variantId: z.string().min(1, { message: "Variant ID is required" }),
    quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
});

export const updateCartQuantitySchema = z.object({
    variantId: z.string().min(1, { message: "Variant ID is required" }),
    quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartQuantityInput = z.infer<typeof updateCartQuantitySchema>;
