// Address Types
export const ADDRESS_TYPES = [
  "SHIPPING",
  "BILLING",
  "BUSINESS",
  "WAREHOUSE",
] as const;
export type AddressType = (typeof ADDRESS_TYPES)[number];

// Nepal Provinces
export const NEPAL_PROVINCES = [
  "Koshi Province",
  "Madhesh Province",
  "Bagmati Province",
  "Gandaki Province",
  "Lumbini Province",
  "Karnali Province",
  "Sudurpashchim Province",
] as const;
export type NepalProvince = (typeof NEPAL_PROVINCES)[number];

// Base Address Interface (aligned with Prisma schema)
export interface BaseAddress {
  id?: string;
  userId?: string;
  type: AddressType;
  label?: string; // Optional in Prisma schema
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phoneNumber?: string; // Optional in Prisma schema
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Form-specific interfaces
export interface AddressFormData
  extends Omit<BaseAddress, "id" | "createdAt" | "updatedAt"> { }

export interface UpdateAddressFormData extends Partial<AddressFormData> {
  id: string;
}

// Validation error types
export type AddressValidationErrors = Partial<
  Record<keyof AddressFormData, string>
>;

// Default form values
export const getDefaultAddressForm = (): AddressFormData => ({
  type: "SHIPPING",
  label: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  country: "NP",
  postalCode: "",
  phoneNumber: "",
  isDefault: false,
});

// Validation Rules
export const VALIDATION_RULES = {
  label: {
    required: false, // Optional in Prisma schema
    minLength: 1,
    maxLength: 50,
    message: "Address label must be less than 50 characters",
  },
  line1: {
    required: true,
    minLength: 1,
    maxLength: 100,
    message: "Address line 1 is required and must be less than 100 characters",
  },
  line2: {
    required: false,
    maxLength: 100,
    message: "Address line 2 must be less than 100 characters",
  },
  city: {
    required: true,
    minLength: 1,
    maxLength: 50,
    message: "City is required and must be less than 50 characters",
  },
  state: {
    required: true,
    minLength: 1,
    message: "State/Province is required",
  },
  country: {
    required: true,
    minLength: 1,
    message: "Country is required",
  },
  postalCode: {
    required: true,
    pattern: /^\d{5}$/,
    message: "Please enter a valid 5-digit postal code",
  },
  phoneNumber: {
    required: true, // Required for order creation
    pattern: /^(\+977)?9[67-9]\d{8}$/,
    minLength: 10,
    message: "Please enter a valid Nepal phone number (e.g., 9812345678)",
  },
  type: {
    required: true,
    enum: ADDRESS_TYPES,
    message: "Please select a valid address type",
  },
} as const;

// Validation Functions
type ValidatedField = keyof typeof VALIDATION_RULES;

export const validateField = (
  field: ValidatedField,
  value: any
): string | null => {
  const rule = VALIDATION_RULES[field];
  const stringValue = String(value || "").trim();

  // Check required fields
  if (rule.required && !stringValue) {
    return rule.message;
  }

  // Skip further validation if field is not required and empty
  if (!rule.required && !stringValue) {
    return null;
  }

  // Check min length
  if ("minLength" in rule && stringValue.length < rule.minLength) {
    return rule.message;
  }

  // Check max length
  if ("maxLength" in rule && stringValue.length > rule.maxLength) {
    return rule.message;
  }

  // Check pattern
  if ("pattern" in rule && !rule.pattern.test(stringValue)) {
    return rule.message;
  }

  // Check enum values
  if ("enum" in rule && !rule.enum.includes(value as any)) {
    return rule.message;
  }

  return null;
};

export const validateAddressForm = (
  formData: Partial<AddressFormData>
): AddressValidationErrors => {
  const errors: AddressValidationErrors = {};

  (Object.keys(VALIDATION_RULES) as ValidatedField[]).forEach((field) => {
    const error = validateField(field, (formData as any)[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

export const isFormValid = (errors: AddressValidationErrors): boolean => {
  return Object.keys(errors).length === 0;
};

// Address display utilities
export const formatAddress = (address: BaseAddress): string => {
  const parts = [
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.postalCode}`,
    address.country !== "NP" ? address.country : null,
  ].filter(Boolean);

  return parts.join(", ");
};

export const formatAddressOneline = (address: BaseAddress): string => {
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postalCode,
  ].filter(Boolean);

  return parts.join(", ");
};

export const getAddressTypeColor = (type: AddressType): string => {
  const colors = {
    SHIPPING: "bg-blue-100 text-blue-800",
    BILLING: "bg-green-100 text-green-800",
    BUSINESS: "bg-purple-100 text-purple-800",
    WAREHOUSE: "bg-orange-100 text-orange-800",
  };
  return colors[type] || "bg-gray-100 text-gray-800";
};

export const getAddressTypeIcon = (type: AddressType): string => {
  const icons = {
    SHIPPING: "🚚",
    BILLING: "💳",
    BUSINESS: "🏢",
    WAREHOUSE: "🏭",
  };
  return icons[type] || "📍";
};

// Phone number formatting utilities
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10 && cleaned.startsWith("9")) {
    return `+977 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
      6
    )}`;
  }
  return phone;
};

export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, "");
};
