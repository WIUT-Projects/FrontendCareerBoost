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

export async function getUsers(pageIndex = 1, pageSize = 20): Promise<PagedUsers> {
  const res = await fetch(
    `${API_URL}/api/users?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    { headers: authHeaders() },
  );
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
