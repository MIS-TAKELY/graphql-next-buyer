// components/page/product/Breadcrumb.tsx
import Link from "next/link";

interface BreadcrumbProps {
  category: string;
  name: string;
}

export default function Breadcrumb({ category, name }: BreadcrumbProps) {
  if (!category || !name) return <div className="text-gray-600 dark:text-gray-300"></div>;

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
      <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
            Home
          </Link>
          <span className="text-gray-500 dark:text-gray-400">/</span>
          <span className="capitalize">{category}</span>
          <span className="text-gray-500 dark:text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white font-medium truncate min-w-0">{name}</span>
        </div>
      </div>
    </div>
  );
}