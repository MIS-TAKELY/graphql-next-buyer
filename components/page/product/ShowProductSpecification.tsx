import React, { useState } from "react";

interface ShowProductSpecificationProps {
  defaultVariant: {
    attributes?: Record<string, string | number | boolean>;
    specifications?: Array<{ key: string; value: string | number }>;
  };
  productSpecificationTable?: Array<{ key: string; value: string }>;
}

const ShowProductSpecification: React.FC<ShowProductSpecificationProps> = ({
  defaultVariant,
  productSpecificationTable = [],
}) => {
  console.log("ShowProductSpecification - productSpecificationTable:", productSpecificationTable);
  const attributes = defaultVariant?.attributes || {};
  const specifications = defaultVariant?.specifications || [];

  // List of attribute keys we want to exclude
  const excludedKeys = [
    "shippingClass",
  ];

  // Filter attributes
  const filteredAttributes = Object.entries(attributes).filter(
    ([key]) => !excludedKeys.includes(key)
  );

  // Filter specifications from variant
  const filteredSpecifications = specifications.filter(
    (spec) => !excludedKeys.includes(spec.key)
  );

  // Parse product specification table if it's not an array (just in case)
  // Parse product specification table
  // Admin saves it as { headers: string[], rows: string[][] }
  let productSpecs: Array<{ key: string; value: string }> = [];

  if (productSpecificationTable) {
    if (Array.isArray(productSpecificationTable)) {
      // Legacy or simple format
      productSpecs = productSpecificationTable;
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

  const combinedData = Array.from(specsMap.entries()).map(([key, value]) => ({
    key,
    value,
  }));

  const [showAll, setShowAll] = useState(false);
  const visibleData = showAll ? combinedData : combinedData.slice(0, 5);

  if (combinedData.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Product Details
      </h2>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm text-gray-700 dark:text-gray-300">
          <tbody>
            {visibleData.map((item, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0
                  ? "bg-gray-50 dark:bg-gray-800/50"
                  : "bg-white dark:bg-gray-900"
                  }`}
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
