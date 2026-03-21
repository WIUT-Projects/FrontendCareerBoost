const SESSION_KEY = import.meta.env.VITE_SESSION_KEY;
const API_URL = import.meta.env.VITE_API_URL;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface StoredSession extends AuthTokens {
  user: {
    id: string;
    email: string;
  };
  profile: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    avatarUrl?: string;
  };
}

interface BackendUserResponse {
  id: number;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  subscriptionTier: string | null;
}

// ─── Role mapping ─────────────────────────────────────────────────────────────

export function mapRole(backendRole: string): string {
  const map: Record<string, string> = {
    JobSeeker: 'jobseeker',
    HrExpert: 'hr_expert',
    Admin: 'admin',
  };
  return map[backendRole] ?? backendRole.toLowerCase();
}

export function getRedirectPathByRole(role: string): string {
  if (role === 'admin') return import.meta.env.VITE_ROUTE_ADMIN;
  if (role === 'hr_expert') return import.meta.env.VITE_ROUTE_HR_PORTAL;
  return import.meta.env.VITE_ROUTE_DASHBOARD;
}

// ─── localStorage ─────────────────────────────────────────────────────────────

export function saveSession(data: StoredSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

export function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

// ─── Backend API calls ────────────────────────────────────────────────────────

export async function getMe(accessToken: string): Promise<BackendUserResponse> {
  const res = await fetch(`${API_URL}${import.meta.env.VITE_API_AUTH_ME}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json() as Promise<BackendUserResponse>;
}

export async function adminLogin(
  email: string,
  password: string
): Promise<AuthTokens> {
  const res = await fetch(`${API_URL}${import.meta.env.VITE_API_AUTH_ADMIN_LOGIN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { title?: string }).title ?? 'Login failed');
  }

  return res.json() as Promise<AuthTokens>;
}

export async function refreshToken(token: string): Promise<AuthTokens> {
  const res = await fetch(`${API_URL}${import.meta.env.VITE_API_AUTH_REFRESH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: token }),
  });

  if (!res.ok) throw new Error('Token refresh failed');
  return res.json() as Promise<AuthTokens>;
}

// ─── Build session from tokens + backend user ────────────────────────────────

export async function buildSession(tokens: AuthTokens): Promise<StoredSession> {
  const backendUser = await getMe(tokens.accessToken);
  const role = mapRole(backendUser.role);

  return {
    ...tokens,
    user: {
      id: String(backendUser.id),
      email: backendUser.email,
    },
    profile: {
      id: String(backendUser.id),
      fullName: backendUser.fullName ?? '',
      email: backendUser.email,
      role,
      avatarUrl: backendUser.avatarUrl ?? undefined,
    },
  };
}
