import Link from "next/link";

interface BreadcrumbProps {
  category: string;
  name: string;
}

export default function Breadcrumb({ category, name }: BreadcrumbProps) {
  if (!category || !name) return <div>loading..</div>;
  // console.log("category",category)
  return (
    <div className="bg-white border-b">
      <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <span>/</span>
          <span className="capitalize">{category}</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{name}</span>
        </div>
      </div>
    </div>
  );
}
