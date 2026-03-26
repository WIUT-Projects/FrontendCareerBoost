import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar, Clock, Video, ClipboardList, Star, ChevronRight, AlertCircle, Copy, Check,
} from 'lucide-react';
import { getHrBookings, type BookingItem } from '@/services/bookingService';
import { resolveMediaUrl, formatLocalTime, isUpcoming } from '@/lib/utils';
import { toast } from 'sonner';

const formatTime = formatLocalTime;

function todayStr() {
  return new Date().toISOString().slice(0, 10); // yyyy-MM-dd
}

// ─── Today session card ───────────────────────────────────────────────────────

function TodaySessionCard({ b }: { b: BookingItem }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const initials = b.jobSeekerName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'JS';
  const upcoming = isUpcoming(b.scheduledAt);

  function copyLink() {
    if (!b.googleMeetLink) return;
    navigator.clipboard.writeText(b.googleMeetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-card border rounded-2xl p-4 space-y-3 hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 ring-2 ring-primary/10 shrink-0">
          {b.jobSeekerAvatar && <AvatarImage src={resolveMediaUrl(b.jobSeekerAvatar)} alt={b.jobSeekerName ?? ''} />}
          <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary/40 text-primary-foreground text-xs font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{b.jobSeekerName ?? 'Job Seeker'}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(b.scheduledAt)}</span>
            <span>{b.durationMinutes} min</span>
            {upcoming
              ? <Badge className="bg-emerald-500/15 text-emerald-600 border-0 text-[10px]">{t('hrDashboard.upcoming')}</Badge>
              : <Badge className="bg-muted text-muted-foreground border-0 text-[10px]">{t('hrDashboard.done')}</Badge>
            }
          </div>
        </div>
        {b.googleMeetLink && upcoming && (
          <Button size="sm" className="gap-1.5 text-xs shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => window.open(b.googleMeetLink!, '_blank')}>
            <Video className="h-3.5 w-3.5" />Join
          </Button>
        )}
      </div>

      {/* Meet link row — always visible */}
      {b.googleMeetLink && (
        <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-1.5">
          <Video className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <code className="flex-1 text-xs text-muted-foreground truncate">{b.googleMeetLink}</code>
          <button onClick={copyLink} className="p-1 rounded hover:bg-background transition-colors shrink-0" title="Copy">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>
        </div>
      )}
    </div>
  );
}

export default function HrPortalDashboard() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const navigate    = useNavigate();
  const [todayBookings, setTodayBookings]   = useState<BookingItem[]>([]);
  const [pendingCount,  setPendingCount]    = useState(0);
  const [loading,       setLoading]         = useState(true);

  useEffect(() => {
    if (!session?.access_token) return;
    setLoading(true);

    Promise.all([
      getHrBookings(session.access_token, 'Approved', todayStr()),
      getHrBookings(session.access_token, 'Pending'),
    ])
      .then(([approved, pending]) => {
        setTodayBookings(approved);
        setPendingCount(pending.length);
      })
      .catch(() => toast.error(t('hrDashboard.loadError')))
      .finally(() => setLoading(false));
  }, [session?.access_token]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold font-display">{t('hrDashboard.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('hrDashboard.subtitle')}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div
            className="bg-card border rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all"
            onClick={() => navigate('/hr-portal/interviews')}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{t('hrDashboard.pending')}</span>
            </div>
            <p className="text-3xl font-bold">{loading ? '–' : pendingCount}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('hrDashboard.awaitingResponse')}</p>
          </div>

          <div
            className="bg-card border rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all"
            onClick={() => navigate('/hr-portal/interviews')}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{t('hrDashboard.today')}</span>
            </div>
            <p className="text-3xl font-bold">{loading ? '–' : todayBookings.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('hrDashboard.sessionsToday')}</p>
          </div>

          <div
            className="bg-card border rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all col-span-2 sm:col-span-1"
            onClick={() => navigate('/hr-portal/reviews')}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <ClipboardList className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{t('hrDashboard.reviews')}</span>
            </div>
            <p className="text-3xl font-bold">–</p>
            <p className="text-xs text-muted-foreground mt-1">{t('hrDashboard.resumeReviewsQueue')}</p>
          </div>
        </div>

        {/* Today's Schedule */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              {t('hrDashboard.schedule')}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1 text-muted-foreground"
              onClick={() => navigate('/hr-portal/interviews')}
            >
              {t('hrDashboard.viewAll')} <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="bg-card border rounded-2xl p-4 flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : todayBookings.length === 0 ? (
            <div className="bg-card border rounded-2xl p-8 text-center text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">{t('hrDashboard.noSessionsToday')}</p>
              <p className="text-xs mt-1">{t('hrDashboard.approvedSessions')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayBookings.map(b => (
                <TodaySessionCard key={b.id} b={b} />
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div>
          <h2 className="text-base font-semibold mb-4">{t('hrDashboard.quickActions')}</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t('hrDashboard.actions.sessionRequests'), desc: t('hrDashboard.actions.sessionRequestsDesc'), url: '/hr-portal/interviews', icon: Calendar },
              { label: t('hrDashboard.actions.reviewQueue'), desc: t('hrDashboard.actions.reviewQueueDesc'), url: '/hr-portal/reviews', icon: ClipboardList },
              { label: t('hrDashboard.actions.myRatings'), desc: t('hrDashboard.actions.myRatingsDesc'), url: '/hr-portal/ratings', icon: Star },
              { label: t('hrDashboard.actions.availability'), desc: t('hrDashboard.actions.availabilityDesc'), url: '/hr-portal/availability', icon: Clock },
            ].map(item => (
              <button
                key={item.url}
                onClick={() => navigate(item.url)}
                className="bg-card border rounded-2xl p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all flex items-start gap-3"
              >
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
