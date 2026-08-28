import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility helper combining clsx condition handling with tailwind-merge conflict resolution
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
