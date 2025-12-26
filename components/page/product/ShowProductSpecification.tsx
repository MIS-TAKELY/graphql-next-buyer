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
  const productSpecs = Array.isArray(productSpecificationTable)
    ? productSpecificationTable
    : [];

  // Combine attributes and specifications
  // Priority: Product Specs -> Variant Specs -> Variant Attributes
  const combinedData = [
    ...productSpecs.map((spec) => ({
      key: spec.key,
      value: spec.value,
    })),
    ...filteredSpecifications.map((spec) => ({
      key: spec.key,
      value: spec.value,
    })),
    ...filteredAttributes.map(([key, value]) => ({
      key,
      value: value?.toString?.() ?? "-",
    })),
  ];

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
