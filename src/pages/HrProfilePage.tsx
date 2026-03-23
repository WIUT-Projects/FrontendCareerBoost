import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft, ShieldCheck, Star, Briefcase, Clock,
  MessageSquare, CalendarPlus, Loader2,
} from 'lucide-react';
import {
  getHrExpertById, bookHrExpert,
  getSpecializationChips, formatPrice,
  type HrExpertItem,
} from '@/services/hrExpertService';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Rating stars ─────────────────────────────────────────────────────────────

function Stars({ rating, size = 'md' }: { rating: number | null; size?: 'sm' | 'md' | 'lg' }) {
  const r = rating ?? 0;
  const sz = size === 'lg' ? 'h-5 w-5' : size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg
          key={i}
          className={cn(sz, i <= Math.round(r) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted')}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.168c.969 0 1.371 1.24.588 1.81l-3.375 2.452a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.375-2.452a1 1 0 00-1.175 0l-3.375 2.452c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.168a1 1 0 00.95-.69L9.05 2.927z" />
        </svg>
      ))}
      {rating != null && (
        <span className={cn('text-muted-foreground ml-1.5 font-medium', size === 'lg' ? 'text-sm' : 'text-xs')}>
          {r.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-muted/40 rounded-xl px-4 py-3 text-center">
      <div className="text-sm font-semibold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

// ─── Booking modal ────────────────────────────────────────────────────────────

interface BookingModalProps {
  open: boolean;
  expert: HrExpertItem;
  onClose: () => void;
  onSuccess: () => void;
}

const DURATION_OPTIONS = [30, 45, 60, 90, 120];

function BookingModal({ open, expert, onClose, onSuccess }: BookingModalProps) {
  const { session } = useAuth();
  const { t } = useTranslation();

  const [date,     setDate]     = useState('');
  const [time,     setTime]     = useState('');
  const [duration, setDuration] = useState('60');
  const [notes,    setNotes]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // Reset form on open
  useEffect(() => {
    if (open) {
      setDate('');
      setTime('');
      setDuration('60');
      setNotes('');
    }
  }, [open]);

  // Minimum date = today
  const today = new Date().toISOString().split('T')[0];

  const handleBook = async () => {
    if (!date || !time) {
      toast.error('Please select a date and time');
      return;
    }

    const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
    const now = new Date();
    if (new Date(scheduledAt) <= now) {
      toast.error('Scheduled time must be in the future');
      return;
    }

    if (!session?.access_token) {
      toast.error('You must be logged in to book a session');
      return;
    }

    setLoading(true);
    try {
      await bookHrExpert(session.access_token, {
        hrExpertId:      expert.id,
        scheduledAt,
        durationMinutes: parseInt(duration),
        notes:           notes.trim() || undefined,
      });
      toast.success('Session booked successfully!');
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-primary" />
            Book a Session
          </DialogTitle>
        </DialogHeader>

        {/* Expert mini card */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border">
          <Avatar className="h-10 w-10 shrink-0">
            {expert.avatarUrl && <AvatarImage src={expert.avatarUrl} alt={expert.fullName ?? ''} />}
            <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
              {expert.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'HR'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{expert.fullName ?? 'HR Expert'}</p>
            <p className="text-xs text-muted-foreground truncate">{expert.headline ?? 'HR Professional'}</p>
          </div>
          <div className="ml-auto shrink-0 text-right">
            <p className="text-sm font-semibold text-primary">{formatPrice(expert.reviewPriceUzs)}</p>
          </div>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="book-date" className="text-xs font-medium">Date</Label>
              <Input
                id="book-date"
                type="date"
                min={today}
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="book-time" className="text-xs font-medium">Time</Label>
              <Input
                id="book-time"
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="book-duration" className="text-xs font-medium">Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger id="book-duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map(d => (
                  <SelectItem key={d} value={String(d)}>
                    {d < 60 ? `${d} min` : `${d / 60}h${d % 60 ? ` ${d % 60}min` : ''}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="book-notes" className="text-xs font-medium">
              Notes <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="book-notes"
              placeholder="Tell the expert what you'd like to focus on..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="resize-none text-sm"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleBook} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HrProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const [expert,       setExpert]       = useState<HrExpertItem | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [notFound,     setNotFound]     = useState(false);
  const [bookingOpen,  setBookingOpen]  = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return; }

    setLoading(true);
    getHrExpertById(Number(id))
      .then(setExpert)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const chips = getSpecializationChips(expert?.specializations ?? null);

  const initials = expert?.fullName
    ? expert.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'HR';

  // ── Loading ──
  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="bg-card border rounded-2xl overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
            <div className="px-6 pb-6 -mt-10 space-y-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (notFound || !expert) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <ShieldCheck className="h-12 w-12 opacity-20" />
        <p className="font-medium">HR Expert not found</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/hr-directory')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to directory
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Back navigation */}
        <button
          onClick={() => navigate('/hr-directory')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          HR Expert Directory
        </button>

        {/* Profile card */}
        <div className="bg-card border rounded-2xl overflow-hidden">
          {/* Cover banner */}
          <div className="h-28 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent" />

          <div className="px-6 pb-6">
            {/* Avatar row */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <Avatar className="h-20 w-20 ring-4 ring-background shrink-0">
                {expert.avatarUrl && <AvatarImage src={expert.avatarUrl} alt={expert.fullName ?? ''} />}
                <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary/40 text-primary-foreground font-bold text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mb-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => navigate(`/messages/${expert.id}`)}
                >
                  <MessageSquare className="h-4 w-4" />
                  Message
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error('Please log in to book a session');
                      navigate('/login');
                      return;
                    }
                    setBookingOpen(true);
                  }}
                >
                  <CalendarPlus className="h-4 w-4" />
                  Book Session
                </Button>
              </div>
            </div>

            {/* Name + verified */}
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold font-display">
                {expert.fullName ?? 'HR Expert'}
              </h1>
              {expert.isVerified && (
                <Badge variant="secondary" className="gap-1 text-primary bg-primary/10 border-primary/20">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Headline */}
            {expert.headline && (
              <p className="text-muted-foreground text-sm mt-1">{expert.headline}</p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-3 mt-3">
              <Stars rating={expert.avgRating} size="lg" />
              <span className="text-sm text-muted-foreground">
                {expert.totalReviews} review{expert.totalReviews !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Specialization chips */}
            {chips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {chips.map(c => (
                  <Badge key={c} variant="secondary" className="text-xs rounded-full px-2.5 py-1 font-normal">
                    {c}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Experience"
            value={expert.yearsExp != null ? (
              <span className="flex items-center justify-center gap-1">
                <Clock className="h-4 w-4 text-primary" />
                {expert.yearsExp} yrs
              </span>
            ) : '—'}
          />
          <StatCard
            label="Session price"
            value={
              <span className="flex items-center justify-center gap-1">
                <Briefcase className="h-4 w-4 text-primary" />
                {formatPrice(expert.reviewPriceUzs)}
              </span>
            }
          />
          <StatCard
            label="Reviews"
            value={
              <span className="flex items-center justify-center gap-1">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                {expert.totalReviews}
              </span>
            }
          />
        </div>

        {/* What to expect section */}
        <div className="bg-card border rounded-2xl p-5 space-y-3">
          <h2 className="font-semibold text-sm">What you can book</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              Resume review &amp; detailed written feedback
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              1-on-1 interview coaching session
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              Career guidance &amp; job search strategy
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              LinkedIn profile optimisation
            </li>
          </ul>
        </div>

        {/* CTA strip */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-sm">Ready to get started?</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Book a session now — {formatPrice(expert.reviewPriceUzs)} per session
            </p>
          </div>
          <Button
            className="gap-1.5 shrink-0"
            onClick={() => {
              if (!isAuthenticated) {
                toast.error('Please log in to book a session');
                navigate('/login');
                return;
              }
              setBookingOpen(true);
            }}
          >
            <CalendarPlus className="h-4 w-4" />
            Book Now
          </Button>
        </div>

      </div>

      {/* Booking modal */}
      <BookingModal
        open={bookingOpen}
        expert={expert}
        onClose={() => setBookingOpen(false)}
        onSuccess={() => {
          setBookingOpen(false);
          navigate('/interviews');
        }}
      />
    </div>
  );
}
