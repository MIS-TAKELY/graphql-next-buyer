// components/page/product/Breadcrumb.tsx
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbProps {
  category?: {
    name: string;
    slug: string;
  } | string;
  name: string;
}

export default function Breadcrumb({ category, name }: BreadcrumbProps) {
  if (!name) return null;

  const categoryName = (category && typeof category === "object") ? category.name : category;
  const categorySlug = (category && typeof category === "object") ? category.slug : (typeof category === "string" ? category.toLowerCase() : "");

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <div className="container-custom py-3 sm:py-4">
        <ol className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs md:text-sm text-muted-foreground whitespace-nowrap overflow-hidden">
          <li className="flex items-center">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </li>

          {categoryName && (
            <>
              <li className="flex items-center">
                <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
              </li>
              <li className="flex items-center">
                <Link
                  href={`/category/${categorySlug}`}
                  className="hover:text-primary transition-colors capitalize truncate max-w-[100px] sm:max-w-[200px]"
                >
                  {categoryName}
                </Link>
              </li>
            </>
          )}

          <li className="flex items-center">
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
          </li>
          <li className="flex items-center font-medium text-foreground truncate min-w-0">
            <span className="truncate">{name}</span>
          </li>
        </ol>
      </div>
    </nav>
  );
}