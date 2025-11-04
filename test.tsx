// // src/app/search/page.tsx
// "use client";

// import { useDynamicSearchFilter } from "@/hooks/dynamicSeaarchFilter/useDynamicSearchFilter";
// import { useSearch } from "@/hooks/search/useSearch";
// import { useSearchParams } from "next/navigation";
// import { useMemo, useState, useEffect } from "react";

// // UI Components (from shadcn/ui or similar)
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
// import { Separator } from "@/components/ui/separator";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Slider } from "@/components/ui/slider";
// import { Filter, Package, Star, X } from "lucide-react";
// import Link from "next/link";

// // --- TYPE DEFINITIONS ---
// interface Specification {
//   value: string;
//   __typename?: string;
// }
// interface Variant {
//   price: number;
//   mrp: number;
//   specifications: Specification[];
// }
// interface Image {
//   altText: string;
//   url: string;
// }
// interface Review {
//   rating: number;
// }
// interface Category {
//   name: string;
// }
// interface SearchProduct {
//   name: string;
//   variants: Variant[];
//   images: Image[];
//   reviews: Review[];
//   description: string;
//   brand: string;
//   slug: string;
//   category: Category;
// }
// interface DynamicSearchData {
//   category: string;
//   filters: { key: string; label: string; type: string; options: string[] | null }[];
// }

// const totalResults = 10677;

// // --- MAIN PAGE COMPONENT ---
// export default function SearchPage() {
//   const searchParams = useSearchParams();
//   const query = searchParams.get("q") || "";
//   const { searchProducts, searchLoading } = useSearch(query);
//   const { dynamicSearchData } = useDynamicSearchFilter(query);

//   const [showFilters, setShowFilters] = useState(false);
//   const [priceRange, setPriceRange] = useState([0, 100000]);
//   const [dynamicFilters, setDynamicFilters] = useState<{ [key: string]: string[] }>({});
//   const [minRating, setMinRating] = useState(0);
//   const [sortBy, setSortBy] = useState("relevance");

//   // --- RESPONSIVE BEHAVIOR ---
//   // Prevent body scroll when mobile filter sheet is open
//   useEffect(() => {
//     if (showFilters) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "auto";
//     }
//     return () => {
//       document.body.style.overflow = "auto";
//     };
//   }, [showFilters]);

//   // --- DATA PROCESSING ---
//   const filterOptions = useMemo(() => {
//     const options: { [key: string]: string[] } = {};
//     dynamicSearchData?.filters?.forEach((filter) => {
//       if (filter.options && filter.options.length > 0) {
//         options[filter.key] = filter.options;
//       }
//     });
//     return options;
//   }, [dynamicSearchData]);

//   const filteredProducts = useMemo(() => {
//     if (!Array.isArray(searchProducts)) return [];
//     let filtered: SearchProduct[] = searchProducts.filter((product) => {
//       const price = product.variants[0]?.price || 0;
//       const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

//       const rating = product.reviews.length > 0 ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length : 0;
//       const matchesRating = rating >= minRating;

//       const matchesDynamicFilters = Object.entries(dynamicFilters).every(([key, selectedValues]) => {
//         if (selectedValues.length === 0) return true;
//         if (key === "brand") return selectedValues.includes(product.brand);
//         if (key === "category") return selectedValues.includes(product.category.name);
//         return product.variants.some((variant) => variant.specifications.some((spec) => selectedValues.includes(spec.value)));
//       });

//       return matchesPrice && matchesRating && matchesDynamicFilters;
//     });

//     switch (sortBy) {
//       case "price-low":
//         filtered.sort((a, b) => (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0));
//         break;
//       case "price-high":
//         filtered.sort((a, b) => (b.variants[0]?.price || 0) - (a.variants[0]?.price || 0));
//         break;
//       case "rating":
//         filtered.sort((a, b) => {
//           const avgRating = (reviews: Review[]) => reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
//           return avgRating(b.reviews) - avgRating(a.reviews);
//         });
//         break;
//       case "popularity":
//         filtered.sort((a, b) => b.reviews.length - a.reviews.length);
//         break;
//     }
//     return filtered;
//   }, [searchProducts, priceRange, dynamicFilters, minRating, sortBy]);

//   // --- EVENT HANDLERS ---
//   const toggleFilter = (key: string, value: string) => {
//     setDynamicFilters((prev) => {
//       const currentValues = prev[key] || [];
//       return currentValues.includes(value)
//         ? { ...prev, [key]: currentValues.filter((v) => v !== value) }
//         : { ...prev, [key]: [...currentValues, value] };
//     });
//   };

//   const clearFilters = () => {
//     setPriceRange([0, 100000]);
//     setDynamicFilters({});
//     setMinRating(0);
//   };

//   const activeFiltersCount =
//     Object.values(dynamicFilters).flat().length +
//     (minRating > 0 ? 1 : 0) +
//     (priceRange[0] > 0 || priceRange[1] < 100000 ? 1 : 0);

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
//       <div className="container mx-auto px-4 py-4 sm:py-6">
//         <SearchHeader
//           query={query}
//           filteredCount={filteredProducts.length}
//           totalResults={totalResults}
//         />

//         <ActiveFilters
//           dynamicFilters={dynamicFilters}
//           minRating={minRating}
//           priceRange={priceRange}
//           toggleFilter={toggleFilter}
//           setPriceRange={setPriceRange}
//           setMinRating={setMinRating}
//           clearFilters={clearFilters}
//           dynamicSearchData={dynamicSearchData}
//         />

//         <main className="mt-4">
//           <SortBar
//             sortBy={sortBy}
//             setSortBy={setSortBy}
//             setShowFilters={setShowFilters}
//             activeFiltersCount={activeFiltersCount}
//           />
//           <div className="flex gap-4 lg:gap-8">
//             {/* --- Mobile Filter Sheet --- */}
//             <div
//               className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden ${showFilters ? "opacity-100" : "opacity-0 pointer-events-none"
//                 }`}
//               onClick={() => setShowFilters(false)}
//             />
//             <div
//               className={`fixed top-0 left-0 z-50 h-full w-full max-w-sm transform bg-background transition-transform lg:hidden ${showFilters ? "translate-x-0" : "-translate-x-full"
//                 }`}
//             >
//               <FilterSidebar
//                 isMobile={true}
//                 setShowFilters={setShowFilters}
//                 priceRange={priceRange}
//                 setPriceRange={setPriceRange}
//                 minRating={minRating}
//                 setMinRating={setMinRating}
//                 dynamicFilters={dynamicFilters}
//                 toggleFilter={toggleFilter}
//                 filterOptions={filterOptions}
//                 dynamicSearchData={dynamicSearchData}
//               />
//             </div>

//             {/* --- Desktop Sidebar --- */}
//             <aside className="hidden lg:block lg:w-72 xl:w-80 flex-shrink-0">
//               <div className="sticky top-20">
//                 <FilterSidebar
//                   isMobile={false}
//                   priceRange={priceRange}
//                   setPriceRange={setPriceRange}
//                   minRating={minRating}
//                   setMinRating={setMinRating}
//                   dynamicFilters={dynamicFilters}
//                   toggleFilter={toggleFilter}
//                   filterOptions={filterOptions}
//                   dynamicSearchData={dynamicSearchData}
//                 />
//               </div>
//             </aside>

//             <div className="flex-1">
//               <ProductGrid
//                 products={filteredProducts}
//                 loading={searchLoading}
//                 clearFilters={clearFilters}
//               />
//               {!searchLoading && filteredProducts.length > 0 && (
//                 <Pagination
//                   filteredCount={filteredProducts.length}
//                   totalResults={totalResults}
//                 />
//               )}
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

// // --- SUB-COMPONENTS ---

// function SearchHeader({ query, filteredCount, totalResults }: { query: string; filteredCount: number; totalResults: number }) {
//   return (
//     <div className="mb-2">
//       <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
//         Search Results
//       </h1>
//       <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
//         <span>Showing</span>
//         <span className="font-semibold text-gray-800 dark:text-gray-200">{filteredCount.toLocaleString()}</span>
//         <span>of</span>
//         <span className="font-semibold text-gray-800 dark:text-gray-200">{totalResults.toLocaleString()}</span>
//         <span>results for</span>
//         <Badge variant="secondary" className="text-sm font-medium">
//           {query}
//         </Badge>
//       </div>
//     </div>
//   );
// }

// function ActiveFilters({
//   dynamicFilters, minRating, priceRange, toggleFilter, setMinRating, setPriceRange, clearFilters, dynamicSearchData
// }: {
//   dynamicFilters: { [key: string]: string[] };
//   minRating: number;
//   priceRange: number[];
//   toggleFilter: (key: string, value: string) => void;
//   setMinRating: (rating: number) => void;
//   setPriceRange: (range: number[]) => void;
//   clearFilters: () => void;
//   dynamicSearchData: DynamicSearchData | null;
// }) {
//   const activeFilterCount = Object.values(dynamicFilters).flat().length + (minRating > 0 ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 100000 ? 1 : 0);
//   if (activeFilterCount === 0) return null;

//   const getFilterLabel = (key: string) => dynamicSearchData?.filters.find((f) => f.key === key)?.label || key.charAt(0).toUpperCase() + key.slice(1);

//   return (
//     <div className="mt-3 mb-4 flex flex-wrap items-center gap-2">
//       <span className="text-sm font-medium">Active Filters:</span>
//       {Object.entries(dynamicFilters).flatMap(([key, values]) =>
//         values.map((value) => (
//           <Badge key={`${key}-${value}`} variant="outline" className="pl-2 pr-1 py-1 text-sm bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/30">
//             {getFilterLabel(key)}: {value}
//             <button onClick={() => toggleFilter(key, value)} className="ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10">
//               <X className="h-3 w-3" />
//             </button>
//           </Badge>
//         ))
//       )}
//       {minRating > 0 && (
//         <Badge variant="outline" className="pl-2 pr-1 py-1 text-sm bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/30">
//           {minRating}+ Stars
//           <button onClick={() => setMinRating(0)} className="ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10">
//             <X className="h-3 w-3" />
//           </button>
//         </Badge>
//       )}
//       {(priceRange[0] > 0 || priceRange[1] < 100000) && (
//         <Badge variant="outline" className="pl-2 pr-1 py-1 text-sm bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/30">
//           Price
//           <button onClick={() => setPriceRange([0, 100000])} className="ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10">
//             <X className="h-3 w-3" />
//           </button>
//         </Badge>
//       )}
//       <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto px-2 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
//         Clear All
//       </Button>
//     </div>
//   );
// }

// function SortBar({ sortBy, setSortBy, setShowFilters, activeFiltersCount }: { sortBy: string; setSortBy: (sort: string) => void; setShowFilters: (show: boolean) => void; activeFiltersCount: number; }) {
//   const sortOptions = [
//     { value: "relevance", label: "Relevance" }, { value: "popularity", label: "Popularity" }, { value: "price-low", label: "Price: Low to High" }, { value: "price-high", label: "Price: High to Low" }, { value: "rating", label: "Customer Rating" },
//   ];

//   return (
//     <div className="mb-4 flex items-center justify-between gap-4">
//       <div className="hidden items-center gap-2 lg:flex">
//         <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by</span>
//         {sortOptions.map((option) => (
//           <Button key={option.value} variant={sortBy === option.value ? "default" : "outline"} size="sm" onClick={() => setSortBy(option.value)}>
//             {option.label}
//           </Button>
//         ))}
//       </div>
//       <div className="flex w-full items-center justify-between lg:hidden">
//         <Button variant="outline" onClick={() => setShowFilters(true)} className="relative">
//           <Filter className="mr-2 h-4 w-4" />
//           Filters
//           {activeFiltersCount > 0 && (
//             <Badge className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full p-0">{activeFiltersCount}</Badge>
//           )}
//         </Button>
//         <select
//           value={sortBy}
//           onChange={(e) => setSortBy(e.target.value)}
//           className="rounded-md border-gray-300 bg-white py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 sm:text-sm"
//         >
//           {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
//         </select>
//       </div>
//     </div>
//   );
// }

// function FilterSidebar({
//   isMobile, setShowFilters, priceRange, setPriceRange, minRating, setMinRating, dynamicFilters, toggleFilter, filterOptions, dynamicSearchData,
// }: {
//   isMobile: boolean;
//   setShowFilters?: (show: boolean) => void;
//   priceRange: number[];
//   setPriceRange: (range: number[]) => void;
//   minRating: number;
//   setMinRating: (rating: number) => void;
//   dynamicFilters: { [key: string]: string[] };
//   toggleFilter: (key: string, value: string) => void;
//   filterOptions: { [key: string]: string[] };
//   dynamicSearchData: DynamicSearchData | null;
// }) {
//   return (
//     <Card className={isMobile ? "h-full border-0 shadow-none rounded-none" : ""}>
//       <CardHeader className={isMobile ? "flex-row items-center justify-between" : ""}>
//         <CardTitle>Filters</CardTitle>
//         {isMobile && (
//           <Button variant="ghost" size="icon" onClick={() => setShowFilters?.(false)}>
//             <X className="h-5 w-5" />
//           </Button>
//         )}
//       </CardHeader>
//       <CardContent className="h-full overflow-y-auto pb-20 lg:pb-6">
//         <div className="space-y-6">
//           <PriceFilter priceRange={priceRange} setPriceRange={setPriceRange} />
//           <Separator />
//           <RatingFilter minRating={minRating} setMinRating={setMinRating} />
//           {dynamicSearchData?.filters?.map((filter) =>
//             (filterOptions[filter.key] || filter.options || []).length > 0 ? (
//               <div key={filter.key}>
//                 <Separator />
//                 <DynamicFilter
//                   filterKey={filter.key}
//                   label={filter.label}
//                   options={filterOptions[filter.key] || filter.options || []}
//                   selectedValues={dynamicFilters[filter.key] || []}
//                   toggleFilter={toggleFilter}
//                 />
//               </div>
//             ) : null
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function DynamicFilter({ filterKey, label, options, selectedValues, toggleFilter }: {
//   filterKey: string; label: string; options: string[]; selectedValues: string[]; toggleFilter: (key: string, value: string) => void;
// }) {
//   const [showAll, setShowAll] = useState(false);
//   const displayedOptions = showAll ? options : options.slice(0, 5);

//   return (
//     <div className="pt-6">
//       <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{label}</h3>
//       <div className="space-y-2">
//         {displayedOptions.map((option) => (
//           <div key={option} className="flex items-center">
//             <Checkbox
//               id={`${filterKey}-${option}`}
//               checked={selectedValues.includes(option)}
//               onCheckedChange={() => toggleFilter(filterKey, option)}
//             />
//             <Label htmlFor={`${filterKey}-${option}`} className="ml-2 text-sm cursor-pointer text-gray-700 dark:text-gray-300">
//               {option}
//             </Label>
//           </div>
//         ))}
//       </div>
//       {options.length > 5 && (
//         <Button variant="link" className="p-0 h-auto mt-2 text-sm" onClick={() => setShowAll(!showAll)}>
//           {showAll ? "Show Less" : `Show ${options.length - 5} More`}
//         </Button>
//       )}
//     </div>
//   );
// }

// function PriceFilter({ priceRange, setPriceRange }: { priceRange: number[]; setPriceRange: (range: number[]) => void; }) {
//   return (
//     <div>
//       <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Price Range</h3>
//       <Slider value={priceRange} onValueChange={setPriceRange} max={100000} step={1000} className="mb-3" />
//       <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
//         <span>₹{priceRange[0].toLocaleString("en-IN")}</span>
//         <span>₹{priceRange[1].toLocaleString("en-IN")}</span>
//       </div>
//     </div>
//   );
// }

// function RatingFilter({ minRating, setMinRating }: { minRating: number; setMinRating: (rating: number) => void; }) {
//   const ratings = [4, 3, 2, 1];
//   return (
//     <div className="pt-6">
//       <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Customer Rating</h3>
//       <div className="space-y-2">
//         {ratings.map((rating) => (
//           <div key={rating} className="flex items-center">
//             <Checkbox
//               id={`rating-${rating}`}
//               checked={minRating === rating}
//               onCheckedChange={() => setMinRating(minRating === rating ? 0 : rating)}
//             />
//             <Label htmlFor={`rating-${rating}`} className="ml-2 flex items-center gap-1.5 text-sm cursor-pointer">
//               <span className="flex">
//                 {Array.from({ length: 5 }).map((_, i) => (
//                   <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300 dark:text-gray-600 dark:fill-gray-600"}`} />
//                 ))}
//               </span>
//               <span className="text-gray-600 dark:text-gray-400">& up</span>
//             </Label>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function ProductGrid({ products, clearFilters, loading = false }: { products: SearchProduct[]; clearFilters: () => void; loading?: boolean; }) {
//   return (
//     <div className="min-h-[60vh]">
//       {loading ? (
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
//           {[...Array(6)].map((_, index) => <ProductCardSkeleton key={index} />)}
//         </div>
//       ) : products.length === 0 ? (
//         <div className="flex h-full min-h-[40vh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-800 py-16 text-center">
//           <Package className="h-16 w-16 text-gray-400 dark:text-gray-600" />
//           <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No Products Found</h3>
//           <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filter settings.</p>
//           <Button onClick={clearFilters} variant="outline" className="mt-6">Clear All Filters</Button>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
//           {products.map((product) => <ProductCard key={product.slug} product={product} />)}
//         </div>
//       )}
//     </div>
//   );
// }

// function ProductCard({ product }: { product: SearchProduct }) {
//   const variant = product.variants[0] || { price: 0, mrp: 0 };
//   const discount = variant.mrp > variant.price ? Math.round(((variant.mrp - variant.price) / variant.mrp) * 100) : 0;
//   const rating = product.reviews.length > 0 ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length : 0;

//   return (
//     <Card className="group relative flex h-full flex-col overflow-hidden transition-shadow duration-200 hover:shadow-xl">
//       <Link href={`/product/${product.slug}`} className="absolute inset-0 z-0" />
//       <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
//         <img
//           src={product.images[0]?.url || "/placeholder-image.jpg"}
//           alt={product.images[0]?.altText || product.name}
//           className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
//         />
//         {discount > 0 && (
//           <Badge className="absolute top-2 left-2 bg-red-600 text-white hover:bg-red-600">
//             {discount}% OFF
//           </Badge>
//         )}
//       </div>
//       <div className="flex flex-1 flex-col p-4">
//         <h3 className="font-semibold text-gray-800 dark:text-gray-200 line-clamp-2">
//           <Link href={`/product/${product.slug}`} className="relative z-10 hover:underline">{product.name}</Link>
//         </h3>
//         {rating > 0 && (
//           <div className="mt-1 flex items-center gap-2 text-sm">
//             <span className="flex items-center gap-1 rounded bg-green-100 px-1.5 py-0.5 text-green-700 dark:bg-green-900/50 dark:text-green-300">
//               <Star className="h-3.5 w-3.5 fill-current" />
//               <span className="font-semibold">{rating.toFixed(1)}</span>
//             </span>
//             <span className="text-gray-500">({product.reviews.length.toLocaleString()} ratings)</span>
//           </div>
//         )}
//         <div className="mt-auto pt-4">
//           <div className="flex items-end justify-between gap-2">
//             <div>
//               <p className="text-xl font-bold text-gray-900 dark:text-white">
//                 ₹{variant.price.toLocaleString("en-IN")}
//               </p>
//               {variant.mrp > variant.price && (
//                 <p className="text-sm text-gray-500 line-through">
//                   ₹{variant.mrp.toLocaleString("en-IN")}
//                 </p>
//               )}
//             </div>
//             <div
//               className="relative z-10 flex items-center"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <Checkbox id={`compare-${product.slug}`} />
//               <Label htmlFor={`compare-${product.slug}`} className="ml-2 text-sm cursor-pointer">
//                 Compare
//               </Label>
//             </div>
//           </div>
//         </div>
//       </div>
//     </Card>
//   );
// }

// function ProductCardSkeleton() {
//   return (
//     <Card className="flex h-full flex-col overflow-hidden">
//       <Skeleton className="aspect-[4/3] w-full" />
//       <div className="flex flex-1 flex-col p-4">
//         <Skeleton className="h-5 w-4/5" />
//         <Skeleton className="mt-1 h-5 w-3/5" />
//         <div className="mt-2 flex items-center gap-2">
//           <Skeleton className="h-6 w-16 rounded-md" />
//           <Skeleton className="h-5 w-20" />
//         </div>
//         <div className="mt-auto pt-4">
//           <div className="flex items-end justify-between">
//             <div>
//               <Skeleton className="h-7 w-24" />
//               <Skeleton className="mt-1 h-5 w-20" />
//             </div>
//             <Skeleton className="h-8 w-24" />
//           </div>
//         </div>
//       </div>
//     </Card>
//   );
// }

// function Pagination({ filteredCount, totalResults }: { filteredCount: number; totalResults: number; }) {
//   // Simple "Load More" implementation. In a real app, this would fetch the next page.
//   const hasMore = totalResults > filteredCount;

//   return (
//     <div className="mt-8 text-center">
//       <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
//         You've viewed {filteredCount} of {totalResults.toLocaleString()} products
//       </p>
//       {hasMore && <Button size="lg">Load More Products</Button>}
//     </div>
//   );
// }