import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft, ChevronRight, Calendar, Clock, Video,
  CheckCircle2, XCircle, Hourglass, Copy, Check, AlertCircle,
} from 'lucide-react';
import { getHrBookings, type BookingItem } from '@/services/bookingService';
import { resolveMediaUrl, utcDate, formatLocalTime, isUpcoming } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Date utils ───────────────────────────────────────────────────────────────

function getWeekStart(d: Date): Date {
  const dt = new Date(d);
  const day = dt.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // Monday first
  dt.setDate(dt.getDate() + diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function addDays(d: Date, n: number): Date {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt;
}

function toYMD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isSameDay(a: Date, b: Date): boolean {
  return toYMD(a) === toYMD(b);
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ─── Status helpers ───────────────────────────────────────────────────────────

function statusColor(s: string | null) {
  if (s === 'Approved') return 'emerald';
  if (s === 'Rejected') return 'red';
  return 'amber';
}

function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? 'Pending';
  if (s === 'Approved')
    return <Badge className="bg-emerald-500/15 text-emerald-600 border-0 text-[10px] font-medium gap-1"><CheckCircle2 className="h-3 w-3" />Approved</Badge>;
  if (s === 'Rejected')
    return <Badge className="bg-destructive/15 text-destructive border-0 text-[10px] font-medium gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
  return <Badge className="bg-amber-500/15 text-amber-600 border-0 text-[10px] font-medium gap-1"><Hourglass className="h-3 w-3" />Pending</Badge>;
}

// ─── Session row ─────────────────────────────────────────────────────────────

function SessionRow({ b }: { b: BookingItem }) {
  const [copied, setCopied] = useState(false);
  const upcoming = isUpcoming(b.scheduledAt);
  const color    = statusColor(b.status);
  const initials = b.jobSeekerName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'JS';

  function copy() {
    if (!b.googleMeetLink) return;
    navigator.clipboard.writeText(b.googleMeetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-card border hover:shadow-sm transition-all">
      {/* Time pill */}
      <div className={`flex-shrink-0 w-16 text-center rounded-lg py-2
        ${color === 'emerald' ? 'bg-emerald-500/10 text-emerald-600' :
          color === 'red'     ? 'bg-destructive/10 text-destructive' :
                                'bg-amber-500/10 text-amber-600'}`}>
        <p className="text-xs font-bold leading-tight">{formatLocalTime(b.scheduledAt)}</p>
        <p className="text-[10px] opacity-70 mt-0.5">{b.durationMinutes}m</p>
      </div>

      {/* Avatar + name */}
      <Avatar className="h-9 w-9 shrink-0 ring-2 ring-border">
        {b.jobSeekerAvatar && <AvatarImage src={resolveMediaUrl(b.jobSeekerAvatar)} alt={b.jobSeekerName ?? ''} />}
        <AvatarFallback className="text-xs font-bold bg-muted">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold truncate">{b.jobSeekerName ?? 'Job Seeker'}</p>
          <StatusBadge status={b.status} />
        </div>

        {b.notes && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">"{b.notes}"</p>
        )}

        {/* Meet link */}
        {b.googleMeetLink && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <Video className="h-3 w-3 text-emerald-500 shrink-0" />
            <code className="text-[11px] text-muted-foreground truncate max-w-[200px]">
              {b.googleMeetLink}
            </code>
            <button onClick={copy} className="p-0.5 rounded hover:text-foreground text-muted-foreground transition-colors shrink-0">
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
        )}
      </div>

      {/* Join btn */}
      {b.googleMeetLink && upcoming && b.status === 'Approved' && (
        <Button
          size="sm"
          className="shrink-0 gap-1.5 text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => window.open(b.googleMeetLink!, '_blank')}
        >
          <Video className="h-3.5 w-3.5" />
          Join
        </Button>
      )}
    </div>
  );
}

// ─── Day strip cell ───────────────────────────────────────────────────────────

function DayCell({
  date, sessions, selected, today, isPast, onClick,
}: {
  date: Date;
  sessions: BookingItem[];
  selected: boolean;
  today: boolean;
  isPast: boolean;
  onClick: () => void;
}) {
  const approved = sessions.filter(s => s.status === 'Approved').length;
  const pending  = sessions.filter(s => s.status === 'Pending').length;
  const hasAny   = sessions.length > 0;
  const dayIdx   = (date.getDay() + 6) % 7; // Mon=0

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 flex-shrink-0 w-10 py-3 rounded-2xl transition-all
        ${selected
          ? 'bg-primary text-primary-foreground shadow-lg scale-105'
          : today
            ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
            : isPast
              ? 'hover:bg-muted/40 text-muted-foreground/50 hover:text-muted-foreground'
              : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
        }`}
    >
      <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">
        {DAY_NAMES[dayIdx]}
      </span>
      <span className="text-sm font-bold leading-none">{date.getDate()}</span>

      {/* Dot indicators */}
      <div className="flex gap-0.5 h-3 items-center">
        {approved > 0 && (
          <span className={`rounded-full h-1.5 w-1.5 ${selected ? 'bg-emerald-300' : 'bg-emerald-500'}`} />
        )}
        {pending > 0 && (
          <span className={`rounded-full h-1.5 w-1.5 ${selected ? 'bg-amber-300' : 'bg-amber-500'}`} />
        )}
        {!hasAny && (
          <span className={`rounded-full h-1 w-1 opacity-20 ${selected ? 'bg-primary-foreground' : 'bg-foreground'}`} />
        )}
      </div>
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HrAvailabilityPage() {
  const { session } = useAuth();
  const [allBookings, setAllBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading]         = useState(true);
  // 14-day window: past 7 days + next 7 days, navigatable by week
  const [weekStart, setWeekStart]     = useState<Date>(() => addDays(getWeekStart(new Date()), -7));
  const [selectedDay, setSelectedDay] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  useEffect(() => {
    if (!session?.access_token) return;
    setLoading(true);
    getHrBookings(session.access_token)
      .then(setAllBookings)
      .catch(() => toast.error('Failed to load schedule'))
      .finally(() => setLoading(false));
  }, [session?.access_token]);

  // Build 14-day array (2 weeks)
  const weekDays = Array.from({ length: 14 }, (_, i) => addDays(weekStart, i));

  // Group bookings by local date (yyyy-MM-dd)
  const byDay = new Map<string, BookingItem[]>();
  allBookings.forEach(b => {
    const key = toYMD(utcDate(b.scheduledAt));
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(b);
  });

  // Sort sessions within each day by time
  byDay.forEach(arr => arr.sort((a, b) =>
    utcDate(a.scheduledAt).getTime() - utcDate(b.scheduledAt).getTime()
  ));

  const selectedKey      = toYMD(selectedDay);
  const selectedSessions = byDay.get(selectedKey) ?? [];
  const today            = new Date(); today.setHours(0, 0, 0, 0);

  // 14-day range stats
  const weekKeys     = weekDays.map(toYMD);
  const weekSessions = allBookings.filter(b => weekKeys.includes(toYMD(utcDate(b.scheduledAt))));
  const weekApproved = weekSessions.filter(b => b.status === 'Approved').length;
  const weekPending  = weekSessions.filter(b => b.status === 'Pending').length;
  const weekRejected = weekSessions.filter(b => b.status === 'Rejected').length;

  const selectedDayIdx = (selectedDay.getDay() + 6) % 7;
  const rangeLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${addDays(weekStart, 13).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Schedule</h1>
          <p className="text-muted-foreground text-sm mt-1">Weekly overview of your interview sessions</p>
        </div>

        {/* Range stats */}
        {!loading && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '14 days',  value: weekSessions.length, color: 'text-foreground' },
              { label: 'Approved', value: weekApproved,        color: 'text-emerald-600' },
              { label: 'Pending',  value: weekPending,         color: 'text-amber-600'   },
            ].map(s => (
              <div key={s.label} className="bg-card border rounded-2xl px-4 py-3 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Week strip */}
        <div className="bg-card border rounded-2xl p-4 space-y-4">
          {/* Nav row */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                const prev = addDays(weekStart, -14);
                setWeekStart(prev);
                setSelectedDay(prev);
              }}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{rangeLabel}</span>
              {!isSameDay(addDays(weekStart, 7), getWeekStart(new Date())) && (
                <button
                  onClick={() => {
                    setWeekStart(addDays(getWeekStart(new Date()), -7));
                    const td = new Date(); td.setHours(0,0,0,0);
                    setSelectedDay(td);
                  }}
                  className="text-xs text-primary hover:underline ml-1"
                >
                  Today
                </button>
              )}
            </div>

            <button
              onClick={() => {
                const next = addDays(weekStart, 14);
                setWeekStart(next);
                setSelectedDay(next);
              }}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day cells */}
          {loading ? (
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {Array.from({ length: 14 }).map((_, i) => (
                <Skeleton key={i} className="flex-shrink-0 w-10 h-20 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="flex gap-1 overflow-x-auto pb-1">
              {weekDays.map(d => (
                <DayCell
                  key={toYMD(d)}
                  date={d}
                  sessions={byDay.get(toYMD(d)) ?? []}
                  selected={isSameDay(d, selectedDay)}
                  today={isSameDay(d, today)}
                  isPast={d < today && !isSameDay(d, today)}
                  onClick={() => setSelectedDay(new Date(d))}
                />
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 pt-1 justify-center">
            {[
              { color: 'bg-emerald-500', label: 'Approved' },
              { color: 'bg-amber-500',  label: 'Pending'  },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={`h-2 w-2 rounded-full ${l.color}`} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Selected day sessions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">
              {isSameDay(selectedDay, today) ? 'Today' : DAY_FULL[selectedDayIdx]}
              <span className="text-muted-foreground font-normal ml-2">
                {selectedDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </h2>
            {selectedSessions.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {selectedSessions.length} session{selectedSessions.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="flex gap-3 p-4 bg-card border rounded-xl">
                  <Skeleton className="h-12 w-16 rounded-lg" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : selectedSessions.length === 0 ? (
            <div className="bg-card border rounded-2xl p-10 text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">No sessions this day</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Select another day or check the Interviews page
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedSessions.map(b => (
                <SessionRow key={b.id} b={b} />
              ))}
            </div>
          )}
        </div>

        {/* All-time quick stats (rejected) */}
        {!loading && weekRejected > 0 && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-2xl px-4 py-3 flex items-center gap-3">
            <XCircle className="h-4 w-4 text-destructive shrink-0" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-destructive">{weekRejected}</span> session{weekRejected !== 1 ? 's' : ''} rejected this week
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
