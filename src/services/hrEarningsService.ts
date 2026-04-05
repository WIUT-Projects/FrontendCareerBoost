import { loadSession } from './authService';

const API_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
  const session = loadSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
  };
}

export interface HrEarningsSummaryDto {
  totalEarned: number;
  pendingEscrow: number;
  availableBalance: number;
  paidOut: number;
  totalBookings: number;
}

export interface HrEarningListItem {
  id: number;
  bookingId: number;
  paymentId: number;
  jobSeekerName: string | null;
  scheduledAt: string | null;
  amountUzs: number;
  platformFeeUzs: number;
  netAmountUzs: number;
  status: 'Pending' | 'Available' | 'PaidOut' | string;
  createdAt: string;
  paidOutAt: string | null;
  payoutNote: string | null;
}

export interface HrEarningsFilter {
  status?: string;
  pageIndex?: number;
  pageSize?: number;
}

export async function getHrEarningsSummary(): Promise<HrEarningsSummaryDto> {
  const res = await fetch(`${API_URL}/api/hr-earnings/summary`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to load earnings summary (${res.status})`);
  return res.json();
}

export async function getHrEarnings(filter: HrEarningsFilter = {}): Promise<HrEarningListItem[]> {
  const params = new URLSearchParams();
  if (filter.status) params.set('status', filter.status);
  params.set('pageIndex', String(filter.pageIndex ?? 0));
  params.set('pageSize', String(filter.pageSize ?? 50));
  const res = await fetch(`${API_URL}/api/hr-earnings?${params.toString()}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to load earnings (${res.status})`);
  return res.json();
}
