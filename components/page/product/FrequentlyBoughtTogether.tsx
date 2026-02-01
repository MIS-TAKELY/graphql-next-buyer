// components/page/product/FrequentlyBoughtTogether.tsx
"use client";

import { GET_FREQUENTLY_BOUGHT_TOGETHER } from "@/client/product/product.queries";
import { useCart } from "@/hooks/cart/useCart";
import { formatPrice } from "@/lib/utils";
import { TProduct } from "@/types/product";
import { useQuery } from "@apollo/client";
import { Check, Plus, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import SmartMedia from "@/components/ui/SmartMedia";
import { getProductUrl } from "@/lib/productUtils";

interface FrequentlyBoughtTogetherProps {
    currentProduct: TProduct;
}

export default function FrequentlyBoughtTogether({
    currentProduct,
}: FrequentlyBoughtTogetherProps) {
    const { data, loading } = useQuery(GET_FREQUENTLY_BOUGHT_TOGETHER, {
        variables: { productId: currentProduct.id, limit: 3 },
        skip: !currentProduct.id,
    });

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const { addToCart } = useCart();

    const boughtTogetherProducts: TProduct[] = data?.getFrequentlyBoughtTogether || [];
    const allProductsInBundle = [currentProduct, ...boughtTogetherProducts];

    useEffect(() => {
        if (allProductsInBundle.length > 0) {
            setSelectedIds(allProductsInBundle.map((p) => p.id));
        }
    }, [data, currentProduct]);

    if (loading) return null;
    if (boughtTogetherProducts.length === 0) return null;

    const toggleProduct = (productId: string) => {
        setSelectedIds((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
    };

    const selectedProducts = allProductsInBundle.filter((p) =>
        selectedIds.includes(p.id)
    );

    const totalPrice = selectedProducts.reduce((sum, p) => {
        const variant = p.variants?.find((v) => v.isDefault) || p.variants?.[0];
        return sum + Number(variant?.price || 0);
    }, 0);

    const handleAddAllToCart = async () => {
        if (selectedProducts.length === 0) return;

        try {
            const promises = selectedProducts.map((p) => {
                const variant = p.variants?.find((v) => v.isDefault) || p.variants?.[0];
                if (variant) {
                    return addToCart(variant.id, p.id, 1);
                }
                return Promise.resolve();
            });

            await Promise.all(promises);
            toast.success(`Added ${selectedProducts.length} items to cart`);
        } catch (error) {
            toast.error("Failed to add some items to cart");
        }
    };

    return (
        <section className="mt-12 mb-16 py-8 bg-gray-50/50 dark:bg-gray-900/50 border-y border-border">
            <div className="container-custom">
                <h2 className="text-2xl font-bold mb-8 text-foreground">Frequently bought together</h2>

                <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                    {/* Products Row */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        {allProductsInBundle.map((product, index) => {
                            const variant = product.variants?.find((v) => v.isDefault) || product.variants?.[0];
                            const isSelected = selectedIds.includes(product.id);
                            const image = product.images?.[0]?.url;

                            return (
                                <div key={product.id} className="flex items-center gap-4 sm:gap-6">
                                    {index > 0 && (
                                        <div className="text-muted-foreground">
                                            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>
                                    )}

                                    <div className="relative group">
                                        <div className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl border-2 transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800 ${isSelected ? 'border-primary shadow-md' : 'border-transparent opacity-60 grayscale-[0.5]'
                                            }`}>
                                            <Link href={getProductUrl({ slug: product.slug, id: product.id })} className="block w-full h-full p-2">
                                                <SmartMedia
                                                    src={image}
                                                    alt={product.name}
                                                    fill
                                                    className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-110"
                                                />
                                            </Link>

                                            <div className="absolute top-1 left-1 z-10">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleProduct(product.id)}
                                                    className="w-5 h-5 rounded shadow-sm bg-white dark:bg-gray-700"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-2 text-center max-w-[128px]">
                                            <p className="text-xs font-medium text-foreground line-clamp-1">{product.name}</p>
                                            <p className="text-sm font-bold text-primary">{formatPrice(Number(variant?.price || 0))}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Bundle Summary */}
                    <div className="flex-1 w-full lg:w-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-border">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                                <span>Selected {selectedProducts.length} items</span>
                                <span className="font-medium text-foreground">Total Price</span>
                            </div>

                            <div className="text-3xl font-bold text-primary text-right">
                                {formatPrice(totalPrice)}
                            </div>

                            <div className="space-y-2">
                                <Button
                                    onClick={handleAddAllToCart}
                                    disabled={selectedProducts.length === 0}
                                    className="w-full h-12 text-base font-bold gap-2 group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    <ShoppingCart className="w-5 h-5 transition-transform group-hover:rotate-12" />
                                    Add {selectedProducts.length} item{selectedProducts.length !== 1 ? 's' : ''} to cart
                                </Button>

                                <p className="text-[10px] text-center text-muted-foreground">
                                    Individual items can be added from their respective pages
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
