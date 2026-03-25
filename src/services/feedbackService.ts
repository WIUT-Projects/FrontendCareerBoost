const API_URL = import.meta.env.VITE_API_URL ?? '';

function authHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export interface FeedbackItem {
  id: number;
  score: number;
  comment: string | null;
  reviewerName: string | null;
  createdAt: string;
}

export async function submitFeedback(
  token: string,
  bookingId: number,
  score: number,
  comment?: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/bookings/${bookingId}/feedback`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ score, comment: comment ?? null }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.title ?? 'Failed to submit feedback');
  }
}

export async function getBookingFeedback(
  token: string,
  bookingId: number,
): Promise<FeedbackItem | null> {
  const res = await fetch(`${API_URL}/api/bookings/${bookingId}/feedback`, {
    headers: authHeaders(token),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load feedback');
  return res.json();
}
