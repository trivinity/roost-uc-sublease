import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Tiny tap of feedback on phones that support it. Silently does nothing elsewhere.
export function haptic(ms = 10) {
  if (typeof navigator !== "undefined") navigator.vibrate?.(ms);
}
