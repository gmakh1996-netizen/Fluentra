import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names and dedupe conflicting Tailwind utilities.
 * Used by every UI primitive so consumer `className` overrides win.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
