import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, locale: "mn" | "en" = "mn"): string {
  // Use a fixed number formatter to avoid Intl currency symbol differences
  // between Node.js (server) and browser ICU data, which causes hydration mismatches.
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return locale === "mn" ? `₮${formatted}` : `MNT ${formatted}`;
}
