const API_URL = import.meta.env.VITE_API_URL ?? '';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HrExpertItem {
  id: number;
  fullName: string | null;
  avatarUrl: string | null;
  headline: string | null;
  specializations: string | null;       // comma-separated
  yearsExp: number | null;
  reviewPriceUzs: number | null;
  avgRating: number | null;
  totalReviews: number;
  isVerified: boolean;
}

export interface HrExpertsPage {
  items: HrExpertItem[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export interface BookHrExpertPayload {
  hrExpertId: number;
  scheduledAt: string;   // ISO string
  durationMinutes?: number;
  resumeId?: number;
  notes?: string;
}

export interface BookingResult {
  id: number;
  hrExpertId: number;
  hrExpertName: string | null;
  scheduledAt: string;
  durationMinutes: number;
  status: string | null;
  notes: string | null;
  createdAt: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function getHrExperts(params?: {
  search?: string;
  specialization?: string;
  pageIndex?: number;
  pageSize?: number;
}): Promise<HrExpertsPage> {
  const q = new URLSearchParams();
  if (params?.search)         q.set('search', params.search);
  if (params?.specialization) q.set('specialization', params.specialization);
  if (params?.pageIndex)      q.set('pageIndex', String(params.pageIndex));
  if (params?.pageSize)       q.set('pageSize', String(params.pageSize));

  const res = await fetch(`${API_URL}/api/hr-experts?${q}`);
  if (!res.ok) throw new Error('Failed to load HR experts');
  return res.json() as Promise<HrExpertsPage>;
}

export async function getHrExpertById(id: number): Promise<HrExpertItem> {
  const res = await fetch(`${API_URL}/api/hr-experts/${id}`);
  if (!res.ok) throw new Error('HR expert not found');
  return res.json() as Promise<HrExpertItem>;
}

export async function bookHrExpert(
  accessToken: string,
  payload: BookHrExpertPayload,
): Promise<BookingResult> {
  const res = await fetch(`${API_URL}/api/hr-experts/book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string; title?: string }).detail ?? 'Booking failed');
  }
  return res.json() as Promise<BookingResult>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getSpecializationChips(s: string | null): string[] {
  if (!s) return [];
  return s.split(',').map(x => x.trim()).filter(Boolean);
}

export function formatPrice(price: number | null): string {
  if (!price) return 'Free';
  return new Intl.NumberFormat('uz-UZ').format(price) + ' UZS';
}
