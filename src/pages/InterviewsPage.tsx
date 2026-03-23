import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Video, ArrowRight, AlertCircle } from 'lucide-react';
import { getMyBookings, type BookingItem } from '@/services/bookingService';
import { resolveMediaUrl, cn, utcDate, formatLocalTime, isUpcoming } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return utcDate(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}
const formatTime = formatLocalTime;

function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? '';
  if (s === 'Approved') return <Badge className="bg-emerald-500/15 text-emerald-600 border-0 font-medium">Approved</Badge>;
  if (s === 'Rejected') return <Badge className="bg-destructive/15 text-destructive border-0 font-medium">Rejected</Badge>;
  return <Badge className="bg-amber-500/15 text-amber-600 border-0 font-medium">Pending</Badge>;
}

function BookingCard({ booking }: { booking: BookingItem }) {
  const navigate = useNavigate();
  const initials = booking.hrExpertName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'HR';
  const upcoming = isUpcoming(booking.scheduledAt);

  return (
    <div
      className="bg-card border rounded-2xl p-5 flex gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
      onClick={() => navigate(`/interviews/${booking.id}`)}
    >
      <Avatar className="h-12 w-12 shrink-0 ring-2 ring-primary/10">
        {booking.hrExpertAvatar && <AvatarImage src={resolveMediaUrl(booking.hrExpertAvatar)} alt={booking.hrExpertName ?? ''} />}
        <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary/40 text-primary-foreground font-bold text-sm">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="font-semibold text-sm">{booking.hrExpertName ?? 'HR Expert'}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(booking.scheduledAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(booking.scheduledAt)} · {booking.durationMinutes} min
              </span>
            </div>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {booking.notes && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-1 italic">"{booking.notes}"</p>
        )}

        {booking.status === 'Approved' && booking.googleMeetLink && (
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              className="gap-1.5 text-xs h-7"
              onClick={e => { e.stopPropagation(); window.open(booking.googleMeetLink!, '_blank'); }}
            >
              <Video className="h-3.5 w-3.5" />
              {upcoming ? 'Join Google Meet' : 'View Recording'}
            </Button>
          </div>
        )}

        {booking.status === 'Pending' && (
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            Waiting for HR expert approval
          </p>
        )}
      </div>

      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-card border rounded-2xl p-5 flex gap-4">
      <Skeleton className="h-12 w-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-56" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'pending' | 'upcoming' | 'past' | 'rejected';

export default function InterviewsPage() {
  const { session } = useAuth();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [allBookings, setAllBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.access_token) return;
    setLoading(true);
    getMyBookings(session.access_token)
      .then(setAllBookings)
      .catch(() => toast.error('Failed to load sessions'))
      .finally(() => setLoading(false));
  }, [session?.access_token]);

  const filtered: BookingItem[] = (() => {
    switch (tab) {
      case 'pending':  return allBookings.filter(b => b.status === 'Pending');
      case 'upcoming': return allBookings.filter(b => b.status === 'Approved' && isUpcoming(b.scheduledAt));
      case 'past':     return allBookings.filter(b => b.status === 'Approved' && !isUpcoming(b.scheduledAt));
      case 'rejected': return allBookings.filter(b => b.status === 'Rejected');
    }
  })();

  const counts = {
    pending:  allBookings.filter(b => b.status === 'Pending').length,
    upcoming: allBookings.filter(b => b.status === 'Approved' && isUpcoming(b.scheduledAt)).length,
    past:     allBookings.filter(b => b.status === 'Approved' && !isUpcoming(b.scheduledAt)).length,
    rejected: allBookings.filter(b => b.status === 'Rejected').length,
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'pending',  label: 'Pending' },
    { key: 'past',     label: 'Past' },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-display">My Sessions</h1>
          <p className="text-sm text-muted-foreground mt-1">Your booked sessions with HR experts</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/40 p-1 rounded-xl w-fit">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5',
                tab === t.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
              {counts[t.key] > 0 && (
                <span className={cn(
                  'text-[10px] rounded-full px-1.5 py-0.5 font-bold min-w-[18px] text-center',
                  tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                )}>
                  {counts[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            : filtered.length > 0
              ? filtered.map(b => <BookingCard key={b.id} booking={b} />)
              : (
                <div className="text-center py-16 text-muted-foreground">
                  <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No {tab} sessions</p>
                  {tab === 'upcoming' && (
                    <p className="text-sm mt-1">
                      Book a session with an{' '}
                      <a href="/hr" className="text-primary hover:underline">HR expert</a>
                    </p>
                  )}
                </div>
              )
          }
        </div>
      </div>
    </div>
  );
}
