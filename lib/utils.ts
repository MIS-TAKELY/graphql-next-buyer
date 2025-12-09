import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price: number | string) => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return `रु ${numPrice.toLocaleString("en-IN")}`;
};
