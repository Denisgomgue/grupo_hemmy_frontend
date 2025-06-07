import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toFloat(value: any): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  return parseFloat(parseFloat(value.toString()).toFixed(2));
}
