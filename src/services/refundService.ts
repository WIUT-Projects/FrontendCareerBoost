import { loadSession } from './authService';

const API_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
  const session = loadSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
  };
}

export interface RefundRequestDto {
  id: number;
  paymentId: number;
  bookingId: number;
  jobSeekerId: number;
  jobSeekerName: string | null;
  jobSeekerEmail: string | null;
  hrExpertId: number | null;
  hrExpertName: string | null;
  sessionScheduledAt: string | null;
  amountUzs: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminNote: string | null;
  reviewedByAdminId: number | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface RefundRequestListResponse {
  items: RefundRequestDto[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

export interface RefundsFilter {
  status?: string;
  jobSeekerId?: number;
  pageIndex?: number;
  pageSize?: number;
}

// ── JobSeeker ─────────────────────────────────────────────────────────────────

export async function createRefundRequest(
  bookingId: number,
  reason: string,
): Promise<RefundRequestDto> {
  const res = await fetch(`${API_URL}/api/refunds`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ bookingId, reason }),
  });
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.detail || body?.title || JSON.stringify(body);
    } catch {
      detail = await res.text().catch(() => '');
    }
    throw new Error(detail || `Refund request failed (${res.status})`);
  }
  return res.json();
}

export async function getMyRefundRequests(): Promise<RefundRequestDto[]> {
  const res = await fetch(`${API_URL}/api/refunds/mine`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch refunds: ${res.status}`);
  return res.json();
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function getAdminRefundRequests(
  filter: RefundsFilter = {},
): Promise<RefundRequestListResponse> {
  const params = new URLSearchParams();
  if (filter.status) params.set('status', filter.status);
  if (filter.jobSeekerId) params.set('jobSeekerId', String(filter.jobSeekerId));
  params.set('pageIndex', String(filter.pageIndex ?? 0));
  params.set('pageSize', String(filter.pageSize ?? 20));
  const res = await fetch(`${API_URL}/api/admin/refunds?${params.toString()}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch refund requests: ${res.status}`);
  return res.json();
}

export async function approveRefundRequest(
  id: number,
  note?: string,
): Promise<RefundRequestDto> {
  const res = await fetch(`${API_URL}/api/admin/refunds/${id}/approve`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ note: note ?? null }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Approve failed (${res.status})`);
  }
  return res.json();
}

export async function rejectRefundRequest(
  id: number,
  note?: string,
): Promise<RefundRequestDto> {
  const res = await fetch(`${API_URL}/api/admin/refunds/${id}/reject`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ note: note ?? null }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Reject failed (${res.status})`);
  }
  return res.json();
}
