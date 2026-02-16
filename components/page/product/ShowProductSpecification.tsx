import React, { useState, useMemo } from "react";

interface ShowProductSpecificationProps {
  defaultVariant: {
    attributes?: Record<string, string | number | boolean>;
    specifications?: Array<{ key: string; value: string | number }>;
  };
  productSpecificationTable?: any; // Single object or Array of Sections
  specificationDisplayFormat?: 'table' | 'bullet' | 'custom_table';
}

interface SpecificationSection {
  title: string;
  headers: string[];
  rows: string[][];
}

const ShowProductSpecification: React.FC<ShowProductSpecificationProps> = ({
  defaultVariant,
  productSpecificationTable,
  specificationDisplayFormat = 'table',
}) => {
  // Detect if we have new Multi-Section format
  const sections: SpecificationSection[] | null = useMemo(() => {
    if (Array.isArray(productSpecificationTable) && productSpecificationTable.length > 0) {
      // Check if it's the new format (objects with title, headers, rows)
      const firstItem = productSpecificationTable[0];
      if (typeof firstItem === 'object' && 'headers' in firstItem && 'rows' in firstItem) {
        return productSpecificationTable as SpecificationSection[];
      }
    }
    return null;
  }, [productSpecificationTable]);


  // If we have distinct sections, render them
  if (sections) {
    // List of dimension-related field names to hide if empty
    const dimensionFields = [
      "width", "height", "length", "weight",
      "Width", "Height", "Length", "Weight"
    ];

    // Helper function to check if a value is empty/invalid
    const isEmptyValue = (value: string) => {
      const trimmedValue = value?.toString().trim() || "";
      return !trimmedValue ||
        trimmedValue === "0" ||
        trimmedValue === "false" ||
        trimmedValue === "-" ||
        trimmedValue.toLowerCase() === "null" ||
        trimmedValue.toLowerCase() === "undefined";
    };

    // Helper function to format values with N/A logic
    const formatValue = (value: string) => {
      return isEmptyValue(value) ? "N/A" : value;
    };

    return (
      <div className="mt-8 space-y-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Product Details
        </h2>
        {sections.map((section, idx) => {
          // Filter out dimension rows that have empty values
          const filteredRows = section.rows.filter((row) => {
            const fieldName = row[0]?.toString().trim() || "";
            const fieldValue = row[1]?.toString().trim() || "";

            // If it's a dimension field, only include it if it has a valid value
            if (dimensionFields.some(df => df.toLowerCase() === fieldName.toLowerCase())) {
              return !isEmptyValue(fieldValue);
            }

            // Include all other fields
            return true;
          });

          // Skip empty sections
          if (!filteredRows || filteredRows.length === 0 || !filteredRows.some(r => r.some(c => c && c.trim()))) {
            return null;
          }

          return (
            <div key={idx} className="space-y-3">
              {section.title && (
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {section.title}
                </h3>
              )}

              {specificationDisplayFormat === "bullet" ? (
                <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                    {filteredRows.map((row, i) => (
                      <li key={i} className="flex items-start gap-3 group">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 group-hover:bg-primary transition-colors shrink-0" />
                        <div className="text-sm">
                          <span className="font-semibold text-gray-900 dark:text-gray-100 mr-2 capitalize">
                            {row[0]}:
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {formatValue(row[1])}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full text-sm text-gray-700 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        {section.headers.map((h, i) => (
                          <th key={i} className="px-4 py-3 text-left font-medium text-gray-900 dark:text-gray-100 border-b dark:border-gray-700">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredRows.map((row, i) => (
                        <tr
                          key={i}
                          className="bg-white dark:bg-gray-900"
                        >
                          {row.map((cell, j) => (
                            <td key={j} className={`px-4 py-2 ${j === 0 ? 'font-medium text-gray-900 dark:text-gray-100 w-1/3' : 'text-gray-700 dark:text-gray-300'}`}>
                              {j === 0 ? cell : formatValue(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // --- Fallback to Legacy Single Table View ---

  const attributes = defaultVariant?.attributes || {};
  const specifications = defaultVariant?.specifications || [];

  // List of attribute keys we want to exclude
  // Exclude dimension fields as they're displayed separately in Product Details
  const excludedKeys = [
    "shippingClass",
    "Width",
    "width",
    "Height",
    "height",
    "Length",
    "length",
    "Weight",
    "weight",
    "IsFragile",
    "isFragile",
    "isFragile",
  ];

  // Filter attributes
  const filteredAttributes = Object.entries(attributes).filter(
    ([key]) => !excludedKeys.includes(key)
  );

  // Filter specifications from variant
  const filteredSpecifications = specifications.filter(
    (spec) => !excludedKeys.includes(spec.key)
  );

  // Parse product specification table
  // Admin saves it as { headers: string[], rows: string[][] }
  let productSpecs: Array<{ key: string; value: string }> = [];

  if (productSpecificationTable) {
    if (Array.isArray(productSpecificationTable)) {
      // Legacy or simple format (Array of key-values)
      productSpecs = productSpecificationTable as any;
    } else if (typeof productSpecificationTable === 'object') {
      // Table format from Admin: { headers, rows }
      const tableData = productSpecificationTable as any;
      if (Array.isArray(tableData.rows)) {
        productSpecs = tableData.rows.map((row: string[]) => {
          // Assume 2-column format: [Feature, Value]
          const key = row[0] || "Feature";
          const value = row.slice(1).join(" ") || "-";
          return { key, value };
        }).filter((item: any) => item.key && item.key.trim() !== "");
      } else {
        // Simple Object format: { Key: Value }
        productSpecs = Object.entries(tableData).map(([key, value]) => ({
          key: key,
          value: value?.toString?.() ?? "-",
        }));
      }
    }
  }

  // Combine attributes and specifications with de-duplication
  // Priority: Variant Attributes -> Variant Specs -> Product Specs
  // We use a Map to ensure unique keys, with later entries overwriting earlier ones.
  // So we add them in REVERSE priority order.

  const specsMap = new Map<string, string>();

  // 1. Lowest priority: Filtered Attributes
  filteredAttributes.forEach(([key, value]) => {
    specsMap.set(key, value?.toString?.() ?? "-");
  });

  // 2. Medium priority: Filtered Specifications (Variant level)
  filteredSpecifications.forEach((spec) => {
    specsMap.set(spec.key, spec.value?.toString?.() ?? "-");
  });

  // 3. Highest priority: Product Specs (Table from Admin)
  productSpecs.forEach((spec) => {
    specsMap.set(spec.key, spec.value);
  });

  // List of dimension-related field names to hide if empty
  const dimensionFields = [
    "width", "height", "length", "weight", "isFragile",
    "Width", "Height", "Length", "Weight", "IsFragile"
  ];

  // Helper function to check if a value is empty/invalid
  const isEmptyValue = (value: string) => {
    const trimmedValue = value?.toString().trim() || "";
    return !trimmedValue ||
      trimmedValue === "0" ||
      trimmedValue === "false" ||
      trimmedValue === "-" ||
      trimmedValue.toLowerCase() === "null" ||
      trimmedValue.toLowerCase() === "undefined";
  };

  const combinedData = Array.from(specsMap.entries())
    .map(([key, value]) => {
      // Show "N/A" for empty, null, undefined, "0", "false", or whitespace-only values
      const displayValue = isEmptyValue(value) ? "N/A" : value;
      return {
        key,
        value: displayValue,
      };
    })
    .filter(({ key, value }) => {
      // Filter out dimension fields that have empty/invalid values
      if (dimensionFields.some(df => df.toLowerCase() === key.toLowerCase())) {
        return value !== "N/A"; // Only include if it has a real value
      }
      return true; // Include all other fields
    });

  const [showAll, setShowAll] = useState(false);
  const visibleData = showAll ? combinedData : combinedData.slice(0, 5);

  if (combinedData.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Product Details
      </h2>

      {specificationDisplayFormat === "bullet" ? (
        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            {visibleData.map((item, index) => (
              <li key={index} className="flex items-start gap-3 group">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 group-hover:bg-primary transition-colors shrink-0" />
                <div className="text-sm">
                  <span className="font-semibold text-gray-900 dark:text-gray-100 mr-2 capitalize">
                    {item.key}:
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {item.value}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm text-gray-700 dark:text-gray-300">
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {visibleData.map((item, index) => (
                <tr
                  key={index}
                  className="bg-white dark:bg-gray-900"
                >
                  <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-100 capitalize w-1/3">
                    {item.key}
                  </td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                    {item.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {combinedData.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          {showAll ? "Show Less" : `Show More (${combinedData.length - 5})`}
        </button>
      )}
    </div>
  );
};

export default ShowProductSpecification;
