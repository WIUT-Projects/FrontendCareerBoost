import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Users, FileText, Brain, CreditCard, TrendingUp,
  ArrowUpRight, ShieldCheck, BookOpen, Briefcase, Clock,
  Star, UserCheck, BarChart3, RefreshCw, AlertTriangle,
  DollarSign, Palette, Calendar,
} from 'lucide-react';
import { getAdminDashboardStats, AdminDashboardStats } from '@/services/adminService';

function formatUzs(n: number): string {
  return new Intl.NumberFormat('uz-UZ').format(n) + ' UZS';
}

function formatInt(n: number): string {
  return n.toLocaleString();
}

function formatMonthLabel(ym: string): string {
  // "2026-03" → "Mar 26"
  const [y, m] = ym.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const mi = Math.max(0, Math.min(11, parseInt(m, 10) - 1));
  return `${months[mi]} ${y.slice(2)}`;
}

export default function AdminOverviewPage() {
  const { t } = useTranslation();

  const { data, isLoading, isError, refetch, isFetching } = useQuery<AdminDashboardStats>({
    queryKey: ['admin-dashboard-stats'],
    queryFn: getAdminDashboardStats,
  });

  const dash = (val: number | string | null | undefined) =>
    isLoading || val == null ? '—' : String(val);

  const sparkline = data?.monthlyRevenue ?? [];
  const maxRevenue = Math.max(1, ...sparkline.map(p => Number(p.amount) || 0));
  const latest = sparkline.at(-1);
  const prev   = sparkline.at(-2);
  const growth = prev && Number(prev.amount) > 0
    ? ((Number(latest?.amount ?? 0) - Number(prev.amount)) / Number(prev.amount)) * 100
    : 0;

  return (
    <div className="h-full overflow-y-auto bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('admin.overview.title', 'Admin Dashboard')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('admin.overview.subtitle', 'Platform overview with live metrics.')}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs hover:bg-accent"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            {t('common.refresh', 'Refresh')}
          </button>
        </div>

        {isError && (
          <div className="rounded-md border border-destructive bg-destructive/10 text-destructive p-3 text-sm">
            Failed to load dashboard stats. <button className="underline ml-2" onClick={() => refetch()}>Retry</button>
          </div>
        )}

        {/* ── Section 1: Core platform KPIs ─────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            {t('admin.overview.platform', 'Platform')}
          </p>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {/* Total Users */}
            <div className="rounded-2xl bg-card border p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{t('admin.overview.totalUsers', 'Total Users')}</span>
                <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold">{dash(data && formatInt(data.totalUsers))}</p>
                {data && data.newUsersThisMonth > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-600">+{data.newUsersThisMonth}</span>
                    <span className="text-xs text-muted-foreground">this month</span>
                  </div>
                )}
              </div>
              {data && (
                <div className="flex gap-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full bg-sky-400 inline-block" /> {formatInt(data.jobSeekersCount)} Jobseekers</span>
                  <span className="flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full bg-violet-400 inline-block" /> {formatInt(data.hrExpertsCount)} HR</span>
                  <span className="flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full bg-rose-400 inline-block" /> {formatInt(data.adminsCount)} Admin</span>
                </div>
              )}
            </div>

            {/* Resumes */}
            <div className="rounded-2xl bg-card border p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{t('admin.overview.resumesCreated', 'Resumes Created')}</span>
                <div className="h-8 w-8 rounded-xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-violet-600" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold">{dash(data && formatInt(data.resumesCount))}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data ? `Avg ${(data.resumesCount / Math.max(1, data.jobSeekersCount)).toFixed(1)} per jobseeker` : ''}
                </p>
              </div>
            </div>

            {/* AI Usage */}
            <div className="rounded-2xl bg-card border p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">AI Analyses</span>
                <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-amber-600" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold">{dash(data && formatInt(data.totalAiAnalyses))}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data ? `$${data.aiTotalCostUsd.toFixed(2)} total cost` : ''}
                </p>
              </div>
            </div>

            {/* Revenue */}
            <div className="rounded-2xl bg-card border p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{t('admin.overview.totalRevenue', 'Total Revenue')}</span>
                <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold">{dash(data && formatUzs(data.totalRevenue))}</p>
                {data && (
                  <div className="flex gap-2 text-[11px] text-muted-foreground mt-1">
                    <span>{formatUzs(data.subscriptionRevenue)} subs</span>
                    <span className="text-border">·</span>
                    <span>{formatUzs(data.bookingGrossRevenue)} HR</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 2: Financial ─────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Financial</p>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <MiniStat
              icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
              value={data ? formatUzs(data.totalRevenue) : '—'}
              label="Total revenue"
            />
            <MiniStat
              icon={<Clock className="h-4 w-4 text-orange-500" />}
              value={data ? formatUzs(data.escrowedBalance) : '—'}
              label="Escrowed"
            />
            <MiniStat
              icon={<ShieldCheck className="h-4 w-4 text-violet-500" />}
              value={data ? formatUzs(data.platformFeeEarned) : '—'}
              label="Platform fee earned"
            />
            <MiniStat
              icon={<Users className="h-4 w-4 text-blue-500" />}
              value={data ? formatUzs(data.pendingPayouts) : '—'}
              label="Pending HR payouts"
            />
            <MiniStat
              icon={<Calendar className="h-4 w-4 text-amber-500" />}
              value={data ? formatInt(data.bookingsTotal) : '—'}
              label="HR sessions booked"
              badge={data ? `${data.bookingsPending} pending` : undefined}
            />
            <MiniStat
              icon={<AlertTriangle className="h-4 w-4 text-rose-500" />}
              value={data ? formatInt(data.openRefundRequests) : '—'}
              label="Open refund requests"
              badge={data && data.openRefundRequests > 0 ? 'action needed' : undefined}
              badgeColor="rose"
            />
          </div>
        </div>

        {/* ── Section 3: Content & Revenue chart ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Platform tiles */}
          <div className="lg:col-span-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Content & Health</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
              <Tile icon={ShieldCheck} value={data ? formatInt(data.hrExpertsCount) : '—'} label="HR experts" color="violet" />
              <Tile icon={BookOpen}    value={data ? formatInt(data.articlesCount) : '—'}  label="Articles"   color="indigo" />
              <Tile icon={Briefcase}   value={data ? formatInt(data.jobPostingsCount) : '—'} label="Job listings" color="sky" />
              <Tile icon={Palette}     value={data ? formatInt(data.templatesCount) : '—'} label="Templates" color="teal" />
              <Tile icon={Calendar}    value={data ? formatInt(data.bookingsApproved) : '—'} label="Approved bookings" color="emerald" />
              <Tile icon={UserCheck}   value={data ? formatInt(data.bookingsCompleted) : '—'} label="Completed sessions" color="blue" />
              <Tile icon={BarChart3}   value={data ? formatInt(data.totalRatings) : '—'} label="Total ratings" color="amber" />
              <Tile
                icon={Star}
                value={data && data.avgHrRating != null ? data.avgHrRating.toFixed(1) : '—'}
                label="Avg HR rating"
                color="orange"
              />
            </div>
          </div>

          {/* Revenue trend (last 6 months) */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Revenue (last 6 months)</p>
            <div className="rounded-2xl bg-card border px-5 py-5 flex flex-col gap-4 h-[calc(100%-28px)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Latest month</p>
                  <p className="text-xl font-bold mt-0.5">{latest ? formatUzs(Number(latest.amount)) : '—'}</p>
                </div>
                {prev && Number(prev.amount) > 0 && (
                  <div className={`flex items-center gap-1 text-xs font-medium ${growth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    <ArrowUpRight className={`h-3.5 w-3.5 ${growth < 0 ? 'rotate-180' : ''}`} />
                    {growth.toFixed(1)}%
                  </div>
                )}
              </div>
              {/* Bars */}
              <div className="flex items-end gap-2 flex-1 min-h-[80px]">
                {sparkline.length === 0
                  ? <div className="flex-1 text-xs text-muted-foreground text-center self-center">No revenue yet</div>
                  : sparkline.map((p, i) => {
                    const h = Math.round((Number(p.amount) / maxRevenue) * 100);
                    const isLast = i === sparkline.length - 1;
                    return (
                      <div key={p.month} className="flex-1 flex flex-col justify-end h-full">
                        <div
                          className="rounded-sm w-full transition-all"
                          style={{
                            height: `${Math.max(2, h)}%`,
                            background: isLast ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.35)',
                          }}
                          title={`${formatMonthLabel(p.month)}: ${formatUzs(Number(p.amount))}`}
                        />
                      </div>
                    );
                  })}
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{sparkline[0] ? formatMonthLabel(sparkline[0].month) : ''}</span>
                <span>{latest ? formatMonthLabel(latest.month) : ''}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

function MiniStat({
  icon, value, label, badge, badgeColor,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  badge?: string;
  badgeColor?: 'rose' | 'emerald';
}) {
  const badgeClass = badgeColor === 'rose'
    ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40'
    : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40';
  return (
    <div className="rounded-2xl bg-card border px-4 py-4 flex flex-col gap-1">
      <div className="flex items-center justify-between mb-2">
        {icon}
        {badge && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${badgeClass}`}>
            {badge}
          </span>
        )}
      </div>
      <p className="text-xl font-bold truncate">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Tile({
  icon: Icon, value, label, color,
}: { icon: any; value: string; label: string; color: string }) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    violet:  { bg: 'bg-violet-100 dark:bg-violet-950/60',   text: 'text-violet-600'   },
    indigo:  { bg: 'bg-indigo-100 dark:bg-indigo-950/60',   text: 'text-indigo-600'   },
    sky:     { bg: 'bg-sky-100 dark:bg-sky-950/60',         text: 'text-sky-600'      },
    teal:    { bg: 'bg-teal-100 dark:bg-teal-950/60',       text: 'text-teal-600'     },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-600'  },
    blue:    { bg: 'bg-blue-100 dark:bg-blue-950/60',       text: 'text-blue-600'     },
    amber:   { bg: 'bg-amber-100 dark:bg-amber-950/60',     text: 'text-amber-600'    },
    orange:  { bg: 'bg-orange-100 dark:bg-orange-950/60',   text: 'text-orange-600'   },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className="rounded-2xl bg-card border px-4 py-3.5 flex items-center gap-3">
      <div className={`h-9 w-9 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`h-4 w-4 ${c.text}`} />
      </div>
      <div>
        <p className="text-xl font-bold leading-none">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{label}</p>
      </div>
    </div>
  );
}
