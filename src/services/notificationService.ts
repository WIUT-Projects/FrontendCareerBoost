const API_URL = import.meta.env.VITE_API_URL ?? '';

export interface NotificationItem {
  id: number;
  userId: number;
  type: string | null;
  title: string | null;
  body: string | null;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function getNotifications(token: string): Promise<NotificationItem[]> {
  const res = await fetch(`${API_URL}/api/notifications`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to load notifications');
  return res.json();
}

export async function markRead(token: string, id: number): Promise<void> {
  await fetch(`${API_URL}/api/notifications/${id}/read`, {
    method: 'PUT',
    headers: authHeaders(token),
  });
}

export async function markAllRead(token: string): Promise<void> {
  await fetch(`${API_URL}/api/notifications/read-all`, {
    method: 'PUT',
    headers: authHeaders(token),
  });
}
