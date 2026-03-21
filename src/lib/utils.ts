import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Agar URL relative bo'lsa (http bilan boshlanmasa),
 * backend domenini boshiga qo'shadi.
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const api = import.meta.env.VITE_API_URL ?? '';
  return `${api}${url}`;
}
