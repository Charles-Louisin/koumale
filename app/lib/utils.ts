import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonction pour calculer le pourcentage de réduction
export const calculateDiscountPercentage = (originalPrice: number, promotionalPrice: number): number => {
  if (originalPrice <= 0 || promotionalPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - promotionalPrice) / originalPrice) * 100);
};
