import {
  ADDRESS_TYPES,
  AddressFormData,
  NEPAL_PROVINCES,
  getAddressTypeIcon,
} from "@/types/address";
import React, { useMemo } from "react";
import { AddressCheckboxField } from "./atoms/AddressCheckboxField";
import { AddressField } from "./atoms/AddressField";
import { AddressSelectField } from "./atoms/AddressSelectField";

interface AddressFieldGroupProps {
  formData: AddressFormData;
  errors: Partial<Record<keyof AddressFormData, string>>;
  onFieldChange: (field: keyof AddressFormData, value: any) => void;
  disabled?: boolean;
  layout?: "grid" | "vertical";
  showTypeField?: boolean;
  showDefaultCheckbox?: boolean;
  className?: string;
}

// Memoized address type options
const addressTypeOptions = ADDRESS_TYPES.map((type) => ({
  value: type,
  label: type.charAt(0) + type.slice(1).toLowerCase(),
  icon: getAddressTypeIcon(type),
  description: `${type.toLowerCase()} purposes`,
}));

// Memoized province options
const provinceOptions = NEPAL_PROVINCES.map((province) => ({
  value: province,
  label: province,
}));

// Memoized country options
const countryOptions = [
  { value: "NP", label: "Nepal" },
  { value: "IN", label: "India" },
  { value: "CN", label: "China" },
  { value: "BD", label: "Bangladesh" },
];

export const AddressFieldGroup = React.memo<AddressFieldGroupProps>(
  ({
    formData,
    errors,
    onFieldChange,
    disabled = false,
    layout = "grid",
    showTypeField = true,
    showDefaultCheckbox = true,
    className = "",
  }) => {
    // Memoize layout class with better vertical spacing
    const layoutClass = useMemo(() => {
      return layout === "grid"
        ? "grid grid-cols-1 md:grid-cols-2 gap-4"
        : "space-y-5"; // Increased spacing for vertical layout
    }, [layout]);

    // Memoize field change handlers to prevent unnecessary re-renders
    const fieldHandlers = useMemo(
      () => ({
        label: (value: string) => onFieldChange("label", value),
        line1: (value: string) => onFieldChange("line1", value),
        line2: (value: string) => onFieldChange("line2", value),
        city: (value: string) => onFieldChange("city", value),
        state: (value: string) => onFieldChange("state", value),
        country: (value: string) => onFieldChange("country", value),
        postalCode: (value: string) => onFieldChange("postalCode", value),
        phoneNumber: (value: string) => onFieldChange("phoneNumber", value),
        type: (value: string) => onFieldChange("type", value),
        isDefault: (value: boolean) => onFieldChange("isDefault", value),
      }),
      [onFieldChange]
    );

    return (
      <div className={`${layout === "vertical" ? "space-y-5" : "space-y-4"} ${className}`}>
        {/* Address Type and Label */}
        {showTypeField && (
          <div className={layoutClass}>
            <AddressField
              name="label"
              label="Address Label"
              value={formData.label ?? ""}
              onChange={fieldHandlers.label}
              error={errors.label}
              disabled={disabled}
              placeholder="Home, Office, etc."
              maxLength={50}
            />

            <AddressSelectField
              name="type"
              label="Address Type"
              value={formData.type}
              onValueChange={fieldHandlers.type}
              options={addressTypeOptions}
              error={errors.type}
              disabled={disabled}
              required
              showIcons
            />
          </div>
        )}

        {/* Address Lines */}
        <div className={layoutClass}>
          <AddressField
            name="line1"
            label="Address Line 1"
            value={formData.line1}
            onChange={fieldHandlers.line1}
            error={errors.line1}
            disabled={disabled}
            required
            placeholder="House number, street name, area"
            maxLength={100}
          />

          <AddressField
            name="line2"
            label="Address Line 2"
            value={formData.line2 ?? ""}
            onChange={fieldHandlers.line2}
            error={errors.line2}
            disabled={disabled}
            placeholder="Apartment, suite, landmark (optional)"
            maxLength={100}
          />
        </div>

        {/* City and Province */}
        <div className={layoutClass}>
          <AddressField
            name="city"
            label="City"
            value={formData.city}
            onChange={fieldHandlers.city}
            error={errors.city}
            disabled={disabled}
            required
            placeholder="Enter city name"
            maxLength={50}
          />

          <AddressSelectField
            name="state"
            label="Province"
            value={formData.state}
            onValueChange={fieldHandlers.state}
            options={provinceOptions}
            error={errors.state}
            disabled={disabled}
            required
            placeholder="Select province"
          />
        </div>

        {/* Postal Code and Country */}
        <div className={layoutClass}>
          <AddressField
            name="postalCode"
            label="Postal Code"
            value={formData.postalCode}
            onChange={fieldHandlers.postalCode}
            error={errors.postalCode}
            disabled={disabled}
            required
            placeholder="Enter 5-digit postal code"
            type="text"
            minLength={5}
            maxLength={5}
          />

          <AddressSelectField
            name="country"
            label="Country"
            value={formData.country}
            onValueChange={fieldHandlers.country}
            options={countryOptions}
            error={errors.country}
            disabled={disabled}
            required
            placeholder="Select country"
          />
        </div>

        {/* Phone Number */}
        <div className={layout === "vertical" ? "" : layoutClass}>
          <AddressField
            name="phoneNumber"
            label="Phone Number"
            value={formData.phoneNumber ?? ""}
            onChange={fieldHandlers.phoneNumber}
            error={errors.phoneNumber}
            disabled={disabled}
            required
            placeholder="Enter phone number"
            type="tel"
            minLength={10}
            maxLength={15}
          />

          {/* Spacer for grid layout only */}
          {layout === "grid" && <div className="hidden md:block" />}
        </div>

        {/* Default Address Checkbox */}
        {showDefaultCheckbox && (
          <div className="pt-3 border-t border-gray-100">
            <AddressCheckboxField
              name="isDefault"
              label="Set as default address"
              checked={formData.isDefault}
              onCheckedChange={fieldHandlers.isDefault}
              error={errors.isDefault}
              disabled={disabled}
              description="This address will be used as the default for future orders"
            />
          </div>
        )}
      </div>
    );
  }
);

AddressFieldGroup.displayName = "AddressFieldGroup";

// Compact version for smaller forms
export const AddressFieldGroupCompact = React.memo<AddressFieldGroupProps>(
  ({ showTypeField = false, showDefaultCheckbox = false, ...props }) => (
    <AddressFieldGroup
      {...props}
      showTypeField={showTypeField}
      showDefaultCheckbox={showDefaultCheckbox}
    />
  )
);

AddressFieldGroupCompact.displayName = "AddressFieldGroupCompact";