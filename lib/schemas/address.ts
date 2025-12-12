import { z } from "zod";

const phoneRegex = /^(\+977)?9[67-9]\d{8}$/;
const postalCodeRegex = /^\d{5}$/;

export const addressSchema = z.object({
    label: z.string().max(50, "Label must be less than 50 characters").optional(),
    line1: z.string().min(1, "Address line 1 is required").max(100, "Address line 1 must be less than 100 characters"),
    line2: z.string().max(100, "Address line 2 must be less than 100 characters").optional(),
    city: z.string().min(1, "City is required").max(50, "City must be less than 50 characters"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    postalCode: z.string().regex(postalCodeRegex, "Please enter a valid 5-digit postal code"),
    phone: z.string().regex(phoneRegex, "Please enter a valid Nepal phone number"),
    type: z.enum(["SHIPPING", "BILLING", "BUSINESS", "WAREHOUSE"], {
        message: "Please select a valid address type",
    }),
    isDefault: z.boolean().default(false),
    // Allow extra fields that might be in AddressFormData but not validated (e.g., userId)
}).passthrough();

export type AddressInput = z.infer<typeof addressSchema>;
