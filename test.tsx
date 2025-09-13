// // app/product/[slug]/page.tsx
// "use client";
// import {
//   GET_PRODUCTS,
//   GET_PRODUCT_BY_SLUG,
//   GET_PRODUCT_DETAILS,
// } from "@/client/product/product.queries";
// import Breadcrumb from "@/components/page/product/Breadcrumb";
// import DeliveryInfo from "@/components/page/product/DeliveryInfo";
// import { ProductActionsClient } from "@/components/page/product/ProductActionsClient";
// import ProductGallery from "@/components/page/product/ProductGallery";
// import ProductInfo from "@/components/page/product/ProductInfo";
// import ProductPageSkeleton from "@/components/page/product/ProductPageSkeleton";
// import ProductTabs from "@/components/page/product/ProductTabs";
// import SellerInfo from "@/components/page/product/SellerInfo";
// import { useQuery } from "@apollo/client";
// import { useParams } from "next/navigation";

// // Mock related products (replace with real query later)
// // const MOCK_PRODUCTS = [
// //   {
// //     id: "1",
// //     title: "iPhone 15 Pro Max",
// //     image: "/iphone-15-pro-max.png",
// //     images: [
// //       "/iphone-15-pro-max.png",
// //       "/iphone-15-pro-max.png",
// //       "/iphone-15-pro-max.png",
// //     ],
// //     rating: 4.5,
// //     price: 1199,
// //     originalPrice: 1299,
// //     category: "electronics",
// //     description:
// //       "The iPhone 15 Pro Max features a titanium design, A17 Pro chip, and advanced camera system with 5x telephoto zoom.",
// //     features: [
// //       "6.7-inch Super Retina XDR display",
// //       "A17 Pro chip with 6-core GPU",
// //       "Pro camera system with 48MP main camera",
// //       "5x telephoto zoom",
// //       "Action Button",
// //       "USB-C connector",
// //       "Up to 29 hours video playback",
// //     ],
// //     specifications: {
// //       Display: "6.7-inch Super Retina XDR",
// //       Chip: "A17 Pro",
// //       Storage: "256GB, 512GB, 1TB",
// //       Camera: "48MP Main, 12MP Ultra Wide, 12MP Telephoto",
// //       Battery: "Up to 29 hours video playback",
// //       "Operating System": "iOS 17",
// //     },
// //     inStock: true,
// //     seller: "Apple Store",
// //     warranty: "1 Year Limited Warranty",
// //   },
// //   {
// //     id: 2,
// //     title: "Samsung Galaxy S24 Ultra",
// //     image: "/samsung-galaxy-s24-ultra.png",
// //     images: [
// //       "/samsung-galaxy-s24-ultra.png",
// //       "/samsung-galaxy-s24-ultra.png",
// //       "/samsung-galaxy-s24-ultra.png",
// //     ],
// //     rating: 4.4,
// //     price: 1099,
// //     originalPrice: 1199,
// //     category: "electronics",
// //     description:
// //       "The Galaxy S24 Ultra combines cutting-edge AI features with S Pen functionality and a powerful camera system.",
// //     features: [
// //       "6.8-inch Dynamic AMOLED 2X display",
// //       "Snapdragon 8 Gen 3 processor",
// //       "200MP main camera with AI zoom",
// //       "Built-in S Pen",
// //       "5000mAh battery",
// //       "IP68 water resistance",
// //       "One UI 6.1 with Galaxy AI",
// //     ],
// //     specifications: {
// //       Display: "6.8-inch Dynamic AMOLED 2X",
// //       Processor: "Snapdragon 8 Gen 3",
// //       Storage: "256GB, 512GB, 1TB",
// //       Camera: "200MP Main, 50MP Periscope, 12MP Ultra Wide",
// //       Battery: "5000mAh with 45W fast charging",
// //       "Operating System": "Android 14 with One UI 6.1",
// //     },
// //     inStock: true,
// //     seller: "Samsung Official",
// //     warranty: "1 Year Manufacturer Warranty",
// //   },
// //   {
// //     id: 3,
// //     title: "MacBook Pro M3",
// //     image: "/macbook-pro-m3.png",
// //     images: [
// //       "/macbook-pro-m3.png",
// //       "/macbook-pro-m3.png",
// //       "/macbook-pro-m3.png",
// //     ],
// //     rating: 4.8,
// //     price: 1999,
// //     originalPrice: 2199,
// //     category: "electronics",
// //     description:
// //       "The MacBook Pro with M3 chip delivers exceptional performance for professionals and creators.",
// //     features: [
// //       "14-inch Liquid Retina XDR display",
// //       "Apple M3 chip with 8-core CPU",
// //       "Up to 22 hours battery life",
// //       "16GB unified memory",
// //       "512GB SSD storage",
// //       "Three Thunderbolt 4 ports",
// //       "1080p FaceTime HD camera",
// //     ],
// //     specifications: {
// //       Display: "14-inch Liquid Retina XDR",
// //       Chip: "Apple M3 with 8-core CPU",
// //       Memory: "16GB unified memory",
// //       Storage: "512GB SSD",
// //       Battery: "Up to 22 hours",
// //       "Operating System": "macOS Sonoma",
// //     },
// //     inStock: true,
// //     seller: "Apple Authorized Reseller",
// //     warranty: "1 Year Limited Warranty",
// //   },
// //   {
// //     id: 4,
// //     title: "Nike Air Max 270",
// //     image: "/nike-air-max-270.png",
// //     images: [
// //       "/nike-air-max-270.png",
// //       "/nike-air-max-270.png",
// //       "/nike-air-max-270.png",
// //     ],
// //     rating: 4.3,
// //     price: 150,
// //     originalPrice: 180,
// //     category: "fashion",
// //     description:
// //       "The Nike Air Max 270 features Nike's biggest heel Air unit yet for all-day comfort and style.",
// //     features: [
// //       "Large heel Air unit for maximum cushioning",
// //       "Breathable mesh upper",
// //       "Rubber outsole with waffle pattern",
// //       "Heel pull tab for easy on/off",
// //       "Foam midsole for lightweight comfort",
// //       "Available in multiple colorways",
// //     ],
// //     specifications: {
// //       Upper: "Mesh and synthetic materials",
// //       Midsole: "Foam with Air Max unit",
// //       Outsole: "Rubber with waffle pattern",
// //       Closure: "Lace-up",
// //       Weight: "Approximately 300g",
// //       Care: "Spot clean with damp cloth",
// //     },
// //     inStock: true,
// //     seller: "Nike Official Store",
// //     warranty: "2 Year Manufacturing Defect Warranty",
// //   },
// //   {
// //     id: 5,
// //     title: "Sony WH-1000XM5",
// //     image: "/sony-wh-1000xm5.png",
// //     images: [
// //       "/sony-wh-1000xm5.png",
// //       "/sony-wh-1000xm5.png",
// //       "/sony-wh-1000xm5.png",
// //     ],
// //     rating: 4.6,
// //     price: 399,
// //     originalPrice: 449,
// //     category: "electronics",
// //     description:
// //       "Industry-leading noise canceling headphones with exceptional sound quality and all-day comfort.",
// //     features: [
// //       "Industry-leading noise canceling",
// //       "30-hour battery life",
// //       "Quick charge: 3 min = 3 hours playback",
// //       "Multipoint connection",
// //       "Speak-to-chat technology",
// //       "Touch sensor controls",
// //       "Premium comfort and sound",
// //     ],
// //     specifications: {
// //       Driver: "30mm dome type",
// //       "Frequency Response": "4Hz-40,000Hz",
// //       "Battery Life": "Up to 30 hours",
// //       Charging: "USB-C quick charge",
// //       Weight: "Approximately 250g",
// //       Connectivity: "Bluetooth 5.2, NFC",
// //     },
// //     inStock: true,
// //     seller: "Sony Electronics",
// //     warranty: "1 Year Limited Warranty",
// //   },
// //   {
// //     id: 6,
// //     title: "Adidas Ultraboost 22",
// //     image: "/adidas-ultraboost-22.png",
// //     images: [
// //       "/adidas-ultraboost-22.png",
// //       "/adidas-ultraboost-22.png",
// //       "/adidas-ultraboost-22.png",
// //     ],
// //     rating: 4.4,
// //     price: 180,
// //     originalPrice: 220,
// //     category: "fashion",
// //     description:
// //       "The Ultraboost 22 features responsive BOOST midsole and Primeknit upper for ultimate running comfort.",
// //     features: [
// //       "BOOST midsole for energy return",
// //       "Primeknit upper for adaptive fit",
// //       "Continental rubber outsole",
// //       "Linear Energy Push system",
// //       "Torsion System for midfoot support",
// //       "Made with recycled materials",
// //     ],
// //     specifications: {
// //       Upper: "Primeknit textile",
// //       Midsole: "BOOST foam",
// //       Outsole: "Continental rubber",
// //       Drop: "10mm",
// //       Weight: "Approximately 320g",
// //       Sustainability: "Made with recycled content",
// //     },
// //     inStock: true,
// //     seller: "Adidas Official",
// //     warranty: "6 Month Manufacturing Defect Warranty",
// //   },
// // ];

// export default function ProductPage() {
//   const params = useParams();
//   const slug = params.slug as string;

//   // Check cache for GET_PRODUCTS data
//   const { data: cachedData } = useQuery(GET_PRODUCTS, {
//     fetchPolicy: "cache-only",
//   });

//   console.log("cachedData product data->", cachedData);
//   // console.log("cachedData client data->",client)

//   const cachedProduct = cachedData?.getProducts?.find(
//     (p: any) => p.slug === slug
//   );

//   // Fetch missing fields (category, brand, seller, warranty, etc.)
//   const {
//     data: detailsData,
//     loading: detailsLoading,
//     error: detailsError,
//   } = useQuery(GET_PRODUCT_DETAILS, {
//     variables: { slug },
//     skip: !slug || !cachedProduct, // Skip if cache hit
//   });

//   if (!cachedData) {
//   }
//   const {
//     data: fallbackData,
//     loading: fallbackLoading,
//     error: fallbackError,
//   } = useQuery(GET_PRODUCT_BY_SLUG, {
//     variables: { slug },
//     skip: !!cachedProduct || !!detailsData, // Skip if we have cached or details data
//   });

//   const product = cachedProduct
//     ? { ...cachedProduct, ...detailsData?.getProductBySlug } // Merge cached and details
//     : fallbackData?.getProductBySlug;

//   // Compute derived values
//   const averageRating = product?.reviews?.length
//     ? product.reviews.reduce(
//         (sum: number, r: any) => sum + (r.rating || 0),
//         0
//       ) / product.reviews.length
//     : 0;

//   const defaultVariant =
//     product?.variants?.find((v: any) => v.isDefault) || product?.variants?.[0];
//   const inStock = defaultVariant ? defaultVariant.stock > 0 : false;
//   const sellerName =
//     product?.brand?.name ||
//     (product?.seller
//       ? `${product.seller.firstName || ""} ${
//           product.seller.lastName || ""
//         }`.trim()
//       : "Unknown Seller");
//   const sortedImages = Array.isArray(product?.images)
//     ? [...product.images].sort(
//         (a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
//       )
//     : product?.images
//     ? [product.images]
//     : [];



//   if ((detailsLoading || fallbackLoading) && !cachedData) {
//     return <ProductPageSkeleton />;
//   }

//   if (detailsError || fallbackError) {
//     return <div>Error: {(detailsError || fallbackError)?.message}</div>;
//   }

//   if (!product) {
//     return <div>Product not found</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Breadcrumb category={product.category?.name} name={product.name} />
//       <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 lg:py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
//           <ProductGallery images={sortedImages} productName={product.name} />
//           <div className="space-y-4">
//             <ProductInfo
//               product={product}
//               averageRating={averageRating}
//               inStock={inStock}
//               defaultVariant={defaultVariant}
//             />
//             <ProductActionsClient
//               productId={product.id || ""}
//               productSlug={slug}
//               variantId={defaultVariant?.id || ""}
//               inStock={inStock}
//             />
//             <DeliveryInfo warranty={product.warranty} />
//             <SellerInfo sellerName={sellerName} />
//           </div>
//         </div>
//         <ProductTabs
//           averageRating={averageRating}
//           mockReviews={product.reviews || []}
//         />
//         {/* {relatedProducts.length > 0 && (
//           <Suspense fallback={<ProductPageSkeleton />}>
//             <RelatedProducts relatedProducts={relatedProducts} />
//           </Suspense>
//         )} */}
//       </div>
//     </div>
//   );
// }
