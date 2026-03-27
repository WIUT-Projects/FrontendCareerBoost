import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ShieldCheck, Star, Briefcase, Clock,
  MessageSquare, CalendarPlus, Loader2, CheckCircle2,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import {
  getHrExpertById, getHrRatings,
  getSpecializationChips, formatPrice,
  type HrExpertItem, type HrRatingItem,
} from '@/services/hrExpertService';
import { createBookingCheckout } from '@/services/bookingService';
import { useAuth } from '@/contexts/AuthContext';
import { cn, resolveMediaUrl } from '@/lib/utils';
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
  onSuccess: (bookingId: number) => void;
}

const DURATION_OPTIONS = [30, 45, 60, 90, 120];

function BookingModal({ open, expert, onClose, onSuccess }: BookingModalProps) {
  const { t } = useTranslation();
  const { session } = useAuth();

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) { setDate(''); setTime(''); setDuration('60'); setNotes(''); }
  }, [open]);

  const today = new Date().toISOString().split('T')[0];

  const durationLabel = (d: number) =>
    d < 60 ? `${d}m` : `${Math.floor(d / 60)}h${d % 60 ? ` ${d % 60}m` : ''}`;

  const handleBook = async () => {
    if (!date || !time) { toast.error(t('booking.selectDateAndTime')); return; }
    const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
    if (new Date(scheduledAt) <= new Date()) { toast.error(t('booking.timeMustBeFuture')); return; }
    if (!session?.access_token) { toast.error(t('booking.mustBeLoggedIn')); return; }
    setLoading(true);
    try {
      const { checkoutUrl } = await createBookingCheckout(session.access_token, {
        hrExpertId: expert.id,
        scheduledAt,
        durationMinutes: parseInt(duration),
        notes: notes.trim() || undefined,
      });
      window.location.href = checkoutUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Booking failed');
      setLoading(false);
    }
  };

  const initials = expert.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'HR';

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[480px] gap-0 p-0 rounded-2xl shadow-2xl">
        <VisuallyHidden><DialogTitle>{t('booking.title')}</DialogTitle></VisuallyHidden>

        {/* ── Title bar ── */}
        <div className="flex items-center gap-2.5 px-5 pt-5 pb-4 border-b">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <CalendarPlus className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-base">{t('booking.title')}</span>
        </div>

        <div className="px-5 pt-4 pb-5 space-y-4">

          {/* ── Expert banner ── */}
          <div className="rounded-xl border bg-muted/20 p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/15">
                {expert.avatarUrl && <AvatarImage src={resolveMediaUrl(expert.avatarUrl)} alt={expert.fullName ?? ''} />}
                <AvatarFallback className="bg-primary/15 text-primary font-bold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{expert.fullName ?? 'HR Expert'}</p>
                <p className="text-xs text-muted-foreground truncate">{expert.headline ?? 'HR Professional'}</p>
              </div>
            </div>
            <div className="mt-2.5 pt-2.5 border-t flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{t('booking.sessionPrice')}</span>
              <span className="text-sm font-bold text-primary">{formatPrice(expert.reviewPriceUzs)}</span>
            </div>
          </div>

          {/* ── Date & Time ── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{t('booking.date')}</p>
              <Input
                type="date"
                min={today}
                value={date}
                onChange={e => setDate(e.target.value)}
                className="h-10 text-sm rounded-xl w-full"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{t('booking.time')}</p>
              <Input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="h-10 text-sm rounded-xl w-full"
              />
            </div>
          </div>

          {/* ── Duration pills ── */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{t('booking.duration')}</p>
            <div className="grid grid-cols-5 gap-1.5">
              {DURATION_OPTIONS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(String(d))}
                  className={cn(
                    'py-2 rounded-lg text-xs font-semibold border transition-all',
                    duration === String(d)
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/60 hover:text-foreground'
                  )}
                >
                  {durationLabel(d)}
                </button>
              ))}
            </div>
          </div>

          {/* ── Notes ── */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              {t('booking.notes')} <span className="normal-case font-normal text-muted-foreground/70">{t('booking.notesOptional')}</span>
            </p>
            <Textarea
              placeholder={t('booking.notesPlaceholder')}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="resize-none text-sm rounded-xl"
            />
          </div>

          {/* ── Footer ── */}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1 rounded-xl h-10">
              {t('booking.cancel')}
            </Button>
            <Button onClick={handleBook} disabled={loading} className="flex-[2] rounded-xl h-10 gap-2 font-semibold">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {loading ? 'Redirecting…' : 'Pay & Book'}
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}

// ─── Reviews carousel ─────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: HrRatingItem }) {
  return (
    <div className="flex-shrink-0 w-72 snap-center rounded-xl border bg-muted/20 p-4 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map(i => (
            <svg
              key={i}
              className={cn(
                'h-4 w-4',
                i <= review.score ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted',
              )}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.168c.969 0 1.371 1.24.588 1.81l-3.375 2.452a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.375-2.452a1 1 0 00-1.175 0l-3.375 2.452c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.168a1 1 0 00.95-.69L9.05 2.927z" />
            </svg>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground flex-shrink-0">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>
      {review.comment && (
        <p className="text-xs text-foreground/80 leading-relaxed line-clamp-4">
          "{review.comment}"
        </p>
      )}
      <p className="text-[11px] font-semibold text-muted-foreground">
        — {review.reviewerName ?? 'Anonymous'}
      </p>
    </div>
  );
}

function ReviewsCarousel({ expertId }: { expertId: number }) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  const { data: reviews = [], isLoading } = useQuery<HrRatingItem[]>({
    queryKey: ['hr-ratings', expertId],
    queryFn: () => getHrRatings(expertId),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="bg-card border rounded-2xl p-5 space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-3">
          <Skeleton className="h-28 w-72 rounded-xl flex-shrink-0" />
          <Skeleton className="h-28 w-72 rounded-xl flex-shrink-0" />
        </div>
      </div>
    );
  }

  if (reviews.length === 0) return null;

  const visible = 2;
  const maxIndex = Math.max(0, reviews.length - visible);
  const canPrev = index > 0;
  const canNext = index < maxIndex;

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          <h2 className="font-semibold text-sm">{t('booking.reviews')}</h2>
          <span className="text-xs text-muted-foreground">({reviews.length})</span>
        </div>
        {reviews.length > visible && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIndex(i => Math.max(0, i - 1))}
              disabled={!canPrev}
              className="h-7 w-7 rounded-lg border flex items-center justify-center transition-colors disabled:opacity-30 hover:bg-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIndex(i => Math.min(maxIndex, i + 1))}
              disabled={!canNext}
              className="h-7 w-7 rounded-lg border flex items-center justify-center transition-colors disabled:opacity-30 hover:bg-accent"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-3 overflow-hidden">
        {reviews.slice(index, index + visible).map(r => (
          <ReviewCard key={r.id} review={r} />
        ))}
        {/* Filler when odd count */}
        {reviews.slice(index, index + visible).length < visible && reviews.length > 0 && (
          <div className="flex-shrink-0 w-72" />
        )}
      </div>

      {/* Dot indicators */}
      {reviews.length > visible && (
        <div className="flex items-center justify-center gap-1 pt-1">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === index ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HrProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const [expert, setExpert] = useState<HrExpertItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

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
        <p className="font-medium">{t('booking.expertNotFound')}</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">


        {/* Profile card */}
        <div className="bg-card border rounded-2xl overflow-hidden">
          {/* Cover banner */}
          <div className="h-28 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent" />

          <div className="px-6 pb-6">
            {/* Avatar row */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <Avatar className="h-20 w-20 ring-4 ring-background shrink-0">
                {expert.avatarUrl && <AvatarImage src={resolveMediaUrl(expert.avatarUrl)} alt={expert.fullName ?? ''} />}
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
                  onClick={() => navigate(`/messages/${expert.id}`, { state: { partnerName: expert.fullName, partnerAvatar: expert.avatarUrl } })}
                >
                  <MessageSquare className="h-4 w-4" />
                  {t('booking.message')}
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error(t('booking.pleaseLoginToBook'));
                      navigate('/login');
                      return;
                    }
                    setBookingOpen(true);
                  }}
                >
                  <CalendarPlus className="h-4 w-4" />
                  {t('booking.bookSession')}
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
                  {t('booking.verified')}
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
                {expert.totalReviews} {expert.totalReviews !== 1 ? t('booking.reviewPlural') : t('booking.reviewSingular')}
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
            label={t('booking.experience')}
            value={expert.yearsExp != null ? (
              <span className="flex items-center justify-center gap-1">
                <Clock className="h-4 w-4 text-primary" />
                {expert.yearsExp} {t('booking.years')}
              </span>
            ) : '—'}
          />
          <StatCard
            label={t('booking.sessionPrice')}
            value={
              <span className="flex items-center justify-center gap-1">
                <Briefcase className="h-4 w-4 text-primary" />
                {formatPrice(expert.reviewPriceUzs)}
              </span>
            }
          />
          <StatCard
            label={t('booking.reviews')}
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
          <h2 className="font-semibold text-sm">{t('booking.whatYouCanBook')}</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              {t('booking.resumeReview')}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              {t('booking.interviewCoaching')}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              {t('booking.careerGuidance')}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              {t('booking.linkedinOptimization')}
            </li>
          </ul>
        </div>

        {/* Reviews carousel */}
        <ReviewsCarousel expertId={Number(id)} />

        {/* CTA strip */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-sm">{t('booking.readyToGetStarted')}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('booking.bookSessionNow', { price: formatPrice(expert.reviewPriceUzs) })}
            </p>
          </div>
          <Button
            className="gap-1.5 shrink-0"
            onClick={() => {
              if (!isAuthenticated) {
                toast.error(t('booking.pleaseLoginToBook'));
                navigate('/login');
                return;
              }
              setBookingOpen(true);
            }}
          >
            <CalendarPlus className="h-4 w-4" />
            {t('booking.bookNow')}
          </Button>
        </div>

      </div>

      {/* Booking modal */}
      <BookingModal
        open={bookingOpen}
        expert={expert}
        onClose={() => setBookingOpen(false)}
        onSuccess={(bookingId) => {
          setBookingOpen(false);
          navigate(`/interviews/${bookingId}`);
        }}
      />
    </div>
  );
}
