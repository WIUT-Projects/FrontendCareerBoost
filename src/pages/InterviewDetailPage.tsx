import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, Calendar, Clock, Video, Copy, Check, FileText, AlertCircle, Star,
} from 'lucide-react';
import { getBookingById, type BookingItem } from '@/services/bookingService';
import { resolveMediaUrl, formatLocalDateTime, isUpcoming } from '@/lib/utils';
import { toast } from 'sonner';
import { getBookingFeedback, type FeedbackItem } from '@/services/feedbackService';
import { FeedbackModal } from '@/components/feedback/FeedbackModal';

const formatDateTime = formatLocalDateTime;

function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? '';
  if (s === 'Approved') return <Badge className="bg-emerald-500/15 text-emerald-600 border-0 font-medium">Approved</Badge>;
  if (s === 'Rejected') return <Badge className="bg-destructive/15 text-destructive border-0 font-medium">Rejected</Badge>;
  return <Badge className="bg-amber-500/15 text-amber-600 border-0 font-medium">Pending</Badge>;
}

export default function InterviewDetailPage() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const { session, profile } = useAuth();
  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState(false);
  const [feedback, setFeedback] = useState<FeedbackItem | null | undefined>(undefined);
  const [feedbackModal, setFeedbackModal] = useState(false);

  useEffect(() => {
    if (!session?.access_token || !id) return;
    getBookingById(session.access_token, Number(id))
      .then(b => {
        setBooking(b);
        if (b?.status === 'Approved') {
          getBookingFeedback(session!.access_token, Number(id))
            .then(f => setFeedback(f))
            .catch(() => setFeedback(null));
        }
      })
      .catch(() => toast.error('Session not found'))
      .finally(() => setLoading(false));
  }, [session?.access_token, id]);

  const isHr      = profile?.role === 'hr_expert';
  const otherName = isHr ? booking?.jobSeekerName : booking?.hrExpertName;
  const otherAvatar = isHr ? booking?.jobSeekerAvatar : booking?.hrExpertAvatar;
  const otherInitials = otherName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  const copyLink = () => {
    if (booking?.googleMeetLink) {
      navigator.clipboard.writeText(booking.googleMeetLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="bg-card border rounded-2xl p-6 space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p className="font-medium">Session not found</p>
          <Button variant="link" onClick={() => navigate(-1)}>Go back</Button>
        </div>
      </div>
    );
  }

  const upcoming = isUpcoming(booking.scheduledAt);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-xl mx-auto px-4 py-8 space-y-5">
        {/* Back */}
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {/* Participant card */}
        <div className="bg-card border rounded-2xl p-6 space-y-5">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 ring-2 ring-primary/10">
              {otherAvatar && <AvatarImage src={resolveMediaUrl(otherAvatar)} alt={otherName ?? ''} />}
              <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary/40 text-primary-foreground font-bold">
                {otherInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold">{otherName ?? (isHr ? 'Job Seeker' : 'HR Expert')}</h2>
                <StatusBadge status={booking.status} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isHr ? 'Job Seeker' : 'HR Expert'}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded-xl p-3 space-y-0.5">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Date & Time</p>
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {formatDateTime(booking.scheduledAt)}
              </p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 space-y-0.5">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Duration</p>
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                {booking.durationMinutes} minutes
              </p>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="bg-muted/30 rounded-xl p-4">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Notes
              </p>
              <p className="text-sm text-foreground italic">"{booking.notes}"</p>
            </div>
          )}
        </div>

        {/* Google Meet section (only if Approved) */}
        {booking.status === 'Approved' && booking.googleMeetLink && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Video className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-700">Google Meet Room</p>
                <p className="text-xs text-emerald-600/70">
                  {upcoming ? 'Your meeting room is ready' : 'Session has ended'}
                </p>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
              <p className="text-xs text-muted-foreground truncate flex-1 font-mono">
                {booking.googleMeetLink}
              </p>
              <button
                onClick={copyLink}
                className="shrink-0 p-1 rounded-md hover:bg-muted transition-colors"
                title="Copy link"
              >
                {copied
                  ? <Check className="h-3.5 w-3.5 text-emerald-600" />
                  : <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                }
              </button>
            </div>

            {upcoming && (
              <Button
                className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => window.open(booking.googleMeetLink!, '_blank')}
              >
                <Video className="h-4 w-4" />
                Join Google Meet
              </Button>
            )}
          </div>
        )}

        {/* Pending state */}
        {booking.status === 'Pending' && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-700">Awaiting Approval</p>
              <p className="text-xs text-amber-600/70 mt-0.5">
                The HR expert will review your request and generate a Google Meet room upon approval.
              </p>
            </div>
          </div>
        )}

        {/* Rejected state */}
        {booking.status === 'Rejected' && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 flex gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-destructive">Session Not Accepted</p>
              <p className="text-xs text-destructive/70 mt-0.5">
                You can book another session with a different time slot.
              </p>
            </div>
          </div>
        )}

        {/* Feedback section — job seeker only, approved booking */}
        {!isHr && booking.status === 'Approved' && (
          <div className="bg-card border rounded-2xl p-5">
            {feedback ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Your Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      className={`h-5 w-5 ${s <= feedback.score ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`}
                    />
                  ))}
                </div>
                {feedback.comment && (
                  <p className="text-sm text-muted-foreground italic">"{feedback.comment}"</p>
                )}
              </div>
            ) : feedback === null ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Rate this session</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Share your experience with this HR expert.</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setFeedbackModal(true)}>
                  <Star className="h-3.5 w-3.5" />
                  Rate
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {booking && feedbackModal && (
        <FeedbackModal
          open={feedbackModal}
          onClose={() => setFeedbackModal(false)}
          bookingId={booking.id}
          hrExpertName={booking.hrExpertName ?? 'HR Expert'}
          onSubmitted={() => {
            getBookingFeedback(session!.access_token, booking.id)
              .then(f => setFeedback(f))
              .catch(() => {});
          }}
        />
      )}
    </div>
  );
}
