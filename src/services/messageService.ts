const API_URL = import.meta.env.VITE_API_URL ?? '';

function authHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export interface ConversationItem {
  partnerId: number;
  partnerName: string | null;
  partnerAvatar: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface MessageItem {
  id: number;
  senderId: number;
  senderName: string | null;
  senderAvatar: string | null;
  body: string | null;
  isRead: boolean;
  createdAt: string;
}

export async function getConversations(token: string): Promise<ConversationItem[]> {
  const res = await fetch(`${API_URL}/api/messages/conversations`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to load conversations');
  return res.json();
}

export async function getMessages(token: string, partnerId: number): Promise<MessageItem[]> {
  const res = await fetch(`${API_URL}/api/messages/${partnerId}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to load messages');
  return res.json();
}

export async function sendMessage(token: string, partnerId: number, body: string): Promise<MessageItem> {
  const res = await fetch(`${API_URL}/api/messages/${partnerId}`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function markAsRead(token: string, partnerId: number): Promise<void> {
  await fetch(`${API_URL}/api/messages/${partnerId}/read`, {
    method: 'PUT',
    headers: authHeaders(token),
  });
}
