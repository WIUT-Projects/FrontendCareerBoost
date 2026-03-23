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

/**
 * Backend DateTime ni har doim UTC sifatida parse qiladi.
 * .NET "2026-03-23T12:00:00" (Z-siz) qaytarsa, JS uni local deb o'qiydi —
 * bu funksiya Z qo'shib to'g'rilaydi.
 */
export function utcDate(iso: string): Date {
  if (!iso) return new Date(NaN);
  const s = iso.endsWith('Z') || iso.includes('+') ? iso : iso + 'Z';
  return new Date(s);
}

/** UTC ISO stringni foydalanuvchining local vaqtida formatlaydi */
export function formatLocalDateTime(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return utcDate(iso).toLocaleString('en-US', opts ?? {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function formatLocalTime(iso: string): string {
  return utcDate(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function isUpcoming(iso: string): boolean {
  return utcDate(iso) > new Date();
}
