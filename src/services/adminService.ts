import { loadSession } from './authService';

const API_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
  const session = loadSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
  };
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface AdminUserDto {
  id: number;
  email: string;
  fullName: string | null;
  role: string; // 'jobSeeker' | 'hrExpert' | 'admin'  (camelCase from backend enum)
  createdAt: string;
  updatedAt: string | null;
}

export interface PagedUsers {
  items: AdminUserDto[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export async function getUsers(
  pageIndex = 1,
  pageSize = 20,
  search?: string,
  role?: string,
): Promise<PagedUsers> {
  const params = new URLSearchParams({ pageIndex: String(pageIndex), pageSize: String(pageSize) });
  if (search) params.set('search', search);
  if (role && role !== 'all') params.set('role', role);
  const res = await fetch(`${API_URL}/api/users?${params}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
  return res.json();
}

export async function updateUserRole(id: number, role: string, fullName: string | null): Promise<AdminUserDto> {
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ role, fullName }),
  });
  if (!res.ok) throw new Error(`Failed to update user: ${res.status}`);
  return res.json();
}

export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete user: ${res.status}`);
}

// ── Templates ─────────────────────────────────────────────────────────────────

export interface AdminTemplateDto {
  id: number;
  name: string;
  tier: string;       // 'free' | 'premium'
  category: string | null;
  isActive: boolean;
  downloadCount: number;
  thumbnailUrl: string | null;
  priceUzs: number | null;
  createdAt: string;
}

export async function getAllTemplatesAdmin(): Promise<{ items: AdminTemplateDto[] }> {
  const res = await fetch(`${API_URL}/api/resume-templates?pageSize=100`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch templates: ${res.status}`);
  return res.json();
}

export interface UpdateTemplatePayload {
  name: string;
  tier: string;
  isActive: boolean;
  category: string | null;
  priceUzs: number | null;
  thumbnailUrl: string | null;
  previewUrl: string | null;
}

export async function updateTemplate(id: number, payload: UpdateTemplatePayload): Promise<AdminTemplateDto> {
  const res = await fetch(`${API_URL}/api/resume-templates/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update template: ${res.status}`);
  return res.json();
}

// ── Jobs ──────────────────────────────────────────────────────────────────

export interface AdminJobDto {
  id: number;
  title: string;
  companyName: string | null;
  postedByName: string | null;
  status: string; // 'draft' | 'active' | 'closed'
  viewsCount: number;
  applicationsCount: number;
  createdAt: string;
  expiresAt: string | null;
}

export interface PagedJobs {
  items: AdminJobDto[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export async function getJobsAdmin(
  pageIndex = 1,
  pageSize = 20,
  search?: string,
  status?: string,
): Promise<PagedJobs> {
  const params = new URLSearchParams({ pageIndex: String(pageIndex), pageSize: String(pageSize) });
  if (search) params.set('search', search);
  if (status && status !== 'all') params.set('status', status);
  const res = await fetch(`${API_URL}/api/admin/jobs?${params}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch jobs: ${res.status}`);
  return res.json();
}

export async function deleteJobAdmin(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/jobs/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete job: ${res.status}`);
}

// ── AI Usage ───────────────────────────────────────────────────────────────

export interface ModelStats {
  count: number;
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
}

export interface AdminAiUsageStats {
  totalAnalyses: number;
  totalTokensInput: number;
  totalTokensOutput: number;
  totalCostUsd: number;
  byModel: Record<string, ModelStats>;
}

export async function getAiUsageStats(token: string): Promise<AdminAiUsageStats> {
  const res = await fetch(`${API_URL}/api/admin/ai-usage/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch AI usage stats');
  return res.json();
}

// ── HR Verification ───────────────────────────────────────────────────────────

export async function updateHrVerificationStatus(
  hrUserId: number,
  isVerified: boolean,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/hr-experts/${hrUserId}/verify`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ isVerified }),
  });
  if (!res.ok) throw new Error(`Failed to update HR verification: ${res.status}`);
}

// ── Admin Payments ────────────────────────────────────────────────────────────

export interface AdminPaymentsSummaryDto {
  totalRevenue: number;
  subscriptionRevenue: number;
  templateRevenue: number;
  bookingGrossRevenue: number;
  escrowedBalance: number;
  platformFeeEarned: number;
  pendingPayouts: number;
  totalPaidOutToHr: number;
  totalPaymentsCount: number;
}

export interface AdminPaymentListItem {
  id: number;
  userId: number;
  userEmail: string | null;
  userFullName: string | null;
  purpose: string;
  status: string;
  amountUzs: number;
  paymentType: string | null;
  stripeSessionId: string | null;
  planName: string | null;
  templateName: string | null;
  bookingId: number | null;
  hrExpertId: number | null;
  hrExpertName: string | null;
  scheduledAt: string | null;
  createdAt: string;
  paidAt: string | null;
  releasedAt: string | null;
}

export interface AdminPaymentsListResponse {
  items: AdminPaymentListItem[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

export interface AdminPaymentsFilter {
  purpose?: string;
  status?: string;
  search?: string;
  pageIndex?: number;
  pageSize?: number;
}

export async function getAdminPayments(filter: AdminPaymentsFilter = {}): Promise<AdminPaymentsListResponse> {
  const params = new URLSearchParams();
  if (filter.purpose) params.set('purpose', filter.purpose);
  if (filter.status)  params.set('status', filter.status);
  if (filter.search)  params.set('search', filter.search);
  params.set('pageIndex', String(filter.pageIndex ?? 0));
  params.set('pageSize',  String(filter.pageSize ?? 20));
  const res = await fetch(`${API_URL}/api/admin/payments?${params.toString()}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch payments: ${res.status}`);
  return res.json();
}

export async function getAdminPaymentsSummary(): Promise<AdminPaymentsSummaryDto> {
  const res = await fetch(`${API_URL}/api/admin/payments/summary`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch payments summary: ${res.status}`);
  return res.json();
}

export interface AdminHrEarning {
  id: number;
  bookingId: number;
  paymentId: number;
  jobSeekerName: string | null;
  scheduledAt: string | null;
  amountUzs: number;
  platformFeeUzs: number;
  netAmountUzs: number;
  status: string;
  createdAt: string;
  paidOutAt: string | null;
  payoutNote: string | null;
}

export async function getAdminHrEarnings(
  status?: string,
  hrExpertId?: number,
): Promise<AdminHrEarning[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (hrExpertId) params.set('hrExpertId', String(hrExpertId));
  params.set('pageSize', '100');
  const res = await fetch(`${API_URL}/api/admin/hr-earnings?${params.toString()}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch HR earnings: ${res.status}`);
  return res.json();
}

export async function markEarningPaidOut(earningId: number, note?: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/hr-earnings/${earningId}/mark-paid`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ note: note ?? null }),
  });
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.detail || body?.title || body?.message || JSON.stringify(body);
    } catch {
      detail = await res.text().catch(() => '');
    }
    throw new Error(`Mark paid failed (${res.status}): ${detail || 'unknown error'}`);
  }
}
