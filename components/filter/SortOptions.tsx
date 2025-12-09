// components/filter/SortOptions.tsx
"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface SortOptionsProps {
    onSortChange: (value: string) => void;
}

export default function SortOptions({ onSortChange }: SortOptionsProps) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Sort By:</span>
            <Select onValueChange={onSortChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Featured" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest Arrivals</SelectItem>
                    <SelectItem value="rating">Avg. Rating</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
