import { loadSession } from './authService';

const API_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
  const session = loadSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
  };
}

export interface PaymentListItemDto {
  id: number;
  userId: number;
  userEmail: string | null;
  userFullName: string | null;
  purpose: 'Subscription' | 'Template' | 'Booking' | string;
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded' | 'Escrowed' | 'Released' | string;
  amountUzs: number;
  paymentType: string | null;
  stripeSessionId: string | null;
  planId: number | null;
  planName: string | null;
  templateId: number | null;
  templateName: string | null;
  bookingId: number | null;
  hrExpertId: number | null;
  hrExpertName: string | null;
  scheduledAt: string | null;
  createdAt: string;
  paidAt: string | null;
  releasedAt: string | null;
}

export interface PaymentListResponse {
  items: PaymentListItemDto[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

export interface MyBillingSummaryDto {
  totalSpent: number;
  subscriptionsTotal: number;
  templatesTotal: number;
  bookingsTotal: number;
  paymentsCount: number;
}

export interface PaymentsFilter {
  purpose?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  pageIndex?: number;
  pageSize?: number;
}

function buildQuery(filter: PaymentsFilter): string {
  const params = new URLSearchParams();
  if (filter.purpose)   params.set('purpose', filter.purpose);
  if (filter.status)    params.set('status', filter.status);
  if (filter.fromDate)  params.set('fromDate', filter.fromDate);
  if (filter.toDate)    params.set('toDate', filter.toDate);
  if (filter.search)    params.set('search', filter.search);
  params.set('pageIndex', String(filter.pageIndex ?? 0));
  params.set('pageSize', String(filter.pageSize ?? 20));
  return params.toString();
}

export async function getMyBillingSummary(): Promise<MyBillingSummaryDto> {
  const res = await fetch(`${API_URL}/api/my/billing/summary`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to load billing summary (${res.status})`);
  return res.json();
}

export async function getMyBillingHistory(filter: PaymentsFilter = {}): Promise<PaymentListResponse> {
  const res = await fetch(`${API_URL}/api/my/billing?${buildQuery(filter)}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to load billing history (${res.status})`);
  return res.json();
}

export async function getMyPaymentDetail(id: number): Promise<PaymentListItemDto> {
  const res = await fetch(`${API_URL}/api/my/billing/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to load payment detail (${res.status})`);
  return res.json();
}
