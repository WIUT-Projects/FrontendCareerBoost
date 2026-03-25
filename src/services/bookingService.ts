const API_URL = import.meta.env.VITE_API_URL ?? '';

export interface BookingItem {
  id: number;
  hrExpertId: number;
  hrExpertName: string | null;
  hrExpertAvatar: string | null;
  jobSeekerId: number;
  jobSeekerName: string | null;
  jobSeekerAvatar: string | null;
  scheduledAt: string;
  durationMinutes: number;
  status: string | null;       // "Pending" | "Approved" | "Rejected"
  googleMeetLink: string | null;
  notes: string | null;
  createdAt: string;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// ─── Job Seeker ───────────────────────────────────────────────────────────────

export async function getMyBookings(
  token: string,
  status?: string,
): Promise<BookingItem[]> {
  const q = new URLSearchParams();
  if (status) q.set('status', status);
  const res = await fetch(`${API_URL}/api/bookings/my?${q}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to load bookings');
  return res.json();
}

// ─── HR Expert ────────────────────────────────────────────────────────────────

export async function getHrBookings(
  token: string,
  status?: string,
  date?: string,         // yyyy-MM-dd
): Promise<BookingItem[]> {
  const q = new URLSearchParams();
  if (status) q.set('status', status);
  if (date)   q.set('date', date);
  const res = await fetch(`${API_URL}/api/bookings/hr?${q}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to load HR bookings');
  return res.json();
}

// ─── Single booking ───────────────────────────────────────────────────────────

export async function getBookingById(
  token: string,
  id: number,
): Promise<BookingItem> {
  const res = await fetch(`${API_URL}/api/bookings/${id}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Booking not found');
  return res.json();
}

// ─── HR actions ───────────────────────────────────────────────────────────────

export async function approveBooking(
  token: string,
  id: number,
  customMeetLink?: string,
): Promise<BookingItem> {
  const res = await fetch(`${API_URL}/api/bookings/${id}/approve`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ customMeetLink: customMeetLink ?? null }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? 'Failed to approve booking');
  }
  return res.json();
}

export async function rejectBooking(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/bookings/${id}/reject`, {
    method: 'PUT',
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? 'Failed to reject booking');
  }
}

