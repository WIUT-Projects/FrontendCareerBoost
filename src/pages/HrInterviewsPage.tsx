import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Calendar, Clock, Video, CheckCircle, XCircle, FileText, Loader2, Copy, Check,
} from 'lucide-react';
import {
  getHrBookings, approveBooking, rejectBooking, type BookingItem,
} from '@/services/bookingService';
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
  if (s === 'Approved') return <Badge className="bg-emerald-500/15 text-emerald-600 border-0">Approved</Badge>;
  if (s === 'Rejected') return <Badge className="bg-destructive/15 text-destructive border-0">Rejected</Badge>;
  return <Badge className="bg-amber-500/15 text-amber-600 border-0">Pending</Badge>;
}

// ─── Pending card ─────────────────────────────────────────────────────────────

function PendingCard({
  booking, onApprove, onReject, processing,
}: {
  booking: BookingItem;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  processing: number | null;
}) {
  const initials = booking.jobSeekerName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'JS';
  const busy = processing === booking.id;

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-11 w-11 shrink-0 ring-2 ring-primary/10">
          {booking.jobSeekerAvatar && <AvatarImage src={resolveMediaUrl(booking.jobSeekerAvatar)} alt={booking.jobSeekerName ?? ''} />}
          <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary/40 text-primary-foreground text-sm font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{booking.jobSeekerName ?? 'Job Seeker'}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(booking.scheduledAt)}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatTime(booking.scheduledAt)} · {booking.durationMinutes} min</span>
          </div>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {booking.notes && (
        <div className="bg-muted/40 rounded-xl px-4 py-3">
          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
            <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="italic">"{booking.notes}"</span>
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          className="gap-1.5 text-xs flex-1"
          onClick={() => onApprove(booking.id)}
          disabled={busy}
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs flex-1 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
          onClick={() => onReject(booking.id)}
          disabled={busy}
        >
          <XCircle className="h-3.5 w-3.5" />
          Reject
        </Button>
      </div>
    </div>
  );
}

// ─── Approved card ────────────────────────────────────────────────────────────

function ApprovedCard({ booking }: { booking: BookingItem }) {
  const [copied, setCopied] = useState(false);
  const initials = booking.jobSeekerName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'JS';
  const upcoming = isUpcoming(booking.scheduledAt);

  function copyLink() {
    if (!booking.googleMeetLink) return;
    navigator.clipboard.writeText(booking.googleMeetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-3">
      <div className="flex items-start gap-3">
        <Avatar className="h-11 w-11 shrink-0 ring-2 ring-emerald-500/20">
          {booking.jobSeekerAvatar && <AvatarImage src={resolveMediaUrl(booking.jobSeekerAvatar)} alt={booking.jobSeekerName ?? ''} />}
          <AvatarFallback className="bg-emerald-500/20 text-emerald-700 text-sm font-bold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{booking.jobSeekerName ?? 'Job Seeker'}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(booking.scheduledAt)}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatTime(booking.scheduledAt)} · {booking.durationMinutes} min</span>
          </div>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {booking.googleMeetLink && (
        <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/20 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <Video className="h-3.5 w-3.5" />
            Google Meet Room
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs rounded-lg px-3 py-1.5 truncate border bg-background/60 text-muted-foreground">
              {booking.googleMeetLink}
            </code>
            <button
              onClick={copyLink}
              className="p-1.5 rounded-lg hover:bg-background/80 text-muted-foreground hover:text-foreground transition-colors shrink-0"
              title="Copy link"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          {upcoming && (
            <Button
              size="sm"
              className="w-full gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => window.open(booking.googleMeetLink!, '_blank')}
            >
              <Video className="h-3.5 w-3.5" />
              Join Google Meet
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-card border rounded-2xl p-5 space-y-3">
      <div className="flex gap-3">
        <Skeleton className="h-11 w-11 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-52" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 flex-1 rounded-lg" />
      </div>
    </div>
  );
}

// ─── Confirm Reject Dialog ────────────────────────────────────────────────────

function RejectDialog({
  open, onClose, onConfirm, loading,
}: { open: boolean; onClose: () => void; onConfirm: () => void; loading: boolean }) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Reject session?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          The job seeker will be notified that their request was not accepted. This cannot be undone.
        </p>
        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="gap-1.5"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'pending' | 'approved' | 'rejected';

export default function HrInterviewsPage() {
  const { session } = useAuth();
  const [tab, setTab]         = useState<Tab>('pending');
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [rejectId, setRejectId]   = useState<number | null>(null);

  const load = useCallback(() => {
    if (!session?.access_token) return;
    setLoading(true);
    getHrBookings(session.access_token)
      .then(setBookings)
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, [session?.access_token]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: number) => {
    if (!session?.access_token) return;
    setProcessing(id);
    try {
      const updated = await approveBooking(session.access_token, id);
      setBookings(prev => prev.map(b => b.id === id ? updated : b));
      toast.success('Session approved! Google Meet link generated.');
      setTab('approved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to approve');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!session?.access_token || !rejectId) return;
    setProcessing(rejectId);
    try {
      await rejectBooking(session.access_token, rejectId);
      setBookings(prev => prev.map(b => b.id === rejectId ? { ...b, status: 'Rejected' } : b));
      toast.success('Session rejected.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to reject');
    } finally {
      setProcessing(null);
      setRejectId(null);
    }
  };

  const filtered = bookings.filter(b => b.status === (
    tab === 'pending' ? 'Pending' : tab === 'approved' ? 'Approved' : 'Rejected'
  ));

  const counts = {
    pending:  bookings.filter(b => b.status === 'Pending').length,
    approved: bookings.filter(b => b.status === 'Approved').length,
    rejected: bookings.filter(b => b.status === 'Rejected').length,
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pending',  label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-display">Session Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage booking requests from job seekers
          </p>
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
                  t.key === 'pending' && counts.pending > 0 && tab !== 'pending' ? 'bg-amber-500 text-white' : '',
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
              ? filtered.map(b =>
                  tab === 'pending' ? (
                    <PendingCard
                      key={b.id}
                      booking={b}
                      onApprove={handleApprove}
                      onReject={id => setRejectId(id)}
                      processing={processing}
                    />
                  ) : (
                    <ApprovedCard
                      key={b.id}
                      booking={b}
                    />
                  )
                )
              : (
                <div className="text-center py-16 text-muted-foreground">
                  <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No {tab} sessions</p>
                </div>
              )
          }
        </div>
      </div>

      <RejectDialog
        open={rejectId !== null}
        onClose={() => setRejectId(null)}
        onConfirm={handleRejectConfirm}
        loading={processing !== null}
      />
    </div>
  );
}
