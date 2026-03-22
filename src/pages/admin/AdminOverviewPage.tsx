import {
  Users, FileText, Brain, CreditCard, TrendingUp, TrendingDown,
  ArrowUpRight, ShieldCheck, BookOpen, Briefcase, Clock,
  Zap, Star, UserCheck, BarChart3, RefreshCw, AlertTriangle,
  DollarSign, Repeat, UserMinus,
} from 'lucide-react';

// ── Sparkline data ─────────────────────────────────────────────────────────────
const SPARKLINE = [42, 58, 35, 67, 52, 78, 61, 90, 74, 83, 69, 95, 88, 76, 102];

// ── Page ───────────────────────────────────────────────────────────────────────
export default function AdminOverviewPage() {
  return (
    <div className="h-full overflow-y-auto bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* ── Section 1: Core platform KPIs ─────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Platform</p>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">

            {/* Total Users */}
            <div className="rounded-2xl bg-card border p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Total Users</span>
                <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold">4,821</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-600">+12.4%</span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="flex gap-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full bg-sky-400 inline-block" /> 4,512 Jobseekers</span>
                <span className="flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full bg-violet-400 inline-block" /> 271 HR</span>
                <span className="flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full bg-rose-400 inline-block" /> 38 Admin</span>
              </div>
            </div>

            {/* Resumes Created */}
            <div className="rounded-2xl bg-card border p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Resumes Created</span>
                <div className="h-8 w-8 rounded-xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-violet-600" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold">11,340</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-600">+8.1%</span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="flex gap-2 text-[11px] text-muted-foreground">
                <span>+340 this week</span>
                <span className="text-border">·</span>
                <span>avg 2.3 per user</span>
              </div>
            </div>

            {/* AI Tokens */}
            <div className="rounded-2xl bg-card border p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">AI Tokens Used</span>
                <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-amber-600" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold">2.3M</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-600">+21.7%</span>
                  <span className="text-xs text-muted-foreground">this month</span>
                </div>
              </div>
              {/* Token quota bar */}
              <div>
                <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                  <span>Monthly quota</span>
                  <span className="font-medium text-amber-600">80% used</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: '80%' }} />
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="rounded-2xl bg-card border p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Total Revenue</span>
                <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold">$8,450</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-rose-500" />
                  <span className="text-xs font-semibold text-rose-600">-3.2%</span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="flex gap-2 text-[11px] text-muted-foreground">
                <span>$6,120 subscriptions</span>
                <span className="text-border">·</span>
                <span>$2,330 HR</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── Section 2: Paid features ───────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Paid Features</p>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">

            <div className="rounded-2xl bg-card border px-4 py-4 flex flex-col gap-1">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full">MRR</span>
              </div>
              <p className="text-2xl font-bold">$6,120</p>
              <p className="text-[11px] text-muted-foreground">Monthly Recurring Revenue</p>
            </div>

            <div className="rounded-2xl bg-card border px-4 py-4 flex flex-col gap-1">
              <div className="flex items-center justify-between mb-2">
                <Repeat className="h-4 w-4 text-blue-500" />
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded-full">+18</span>
              </div>
              <p className="text-2xl font-bold">347</p>
              <p className="text-[11px] text-muted-foreground">Active Subscriptions</p>
            </div>

            <div className="rounded-2xl bg-card border px-4 py-4 flex flex-col gap-1">
              <div className="flex items-center justify-between mb-2">
                <UserMinus className="h-4 w-4 text-rose-500" />
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded-full">↑ 0.3%</span>
              </div>
              <p className="text-2xl font-bold">2.1%</p>
              <p className="text-[11px] text-muted-foreground">Churn Rate</p>
            </div>

            <div className="rounded-2xl bg-card border px-4 py-4 flex flex-col gap-1">
              <div className="flex items-center justify-between mb-2">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-full">+7</span>
              </div>
              <p className="text-2xl font-bold">84</p>
              <p className="text-[11px] text-muted-foreground">HR Sessions Booked</p>
            </div>

            <div className="rounded-2xl bg-card border px-4 py-4 flex flex-col gap-1">
              <div className="flex items-center justify-between mb-2">
                <Zap className="h-4 w-4 text-violet-500" />
                <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 dark:bg-violet-950/40 px-1.5 py-0.5 rounded-full">+43</span>
              </div>
              <p className="text-2xl font-bold">612</p>
              <p className="text-[11px] text-muted-foreground">AI Credits Purchased</p>
            </div>

            <div className="rounded-2xl bg-card border px-4 py-4 flex flex-col gap-1">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-1.5 py-0.5 rounded-full">open</span>
              </div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-[11px] text-muted-foreground">Refund Requests</p>
            </div>

          </div>
        </div>

        {/* ── Section 3: Content & Platform health ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

          {/* Platform health tiles */}
          <div className="lg:col-span-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Content & Platform</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
              {[
                { label: 'Active HR Experts', value: '38',  icon: ShieldCheck, color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-950/60' },
                { label: 'Published Articles', value: '127', icon: BookOpen,   color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-950/60' },
                { label: 'Open Job Listings', value: '214',  icon: Briefcase,  color: 'text-sky-500',    bg: 'bg-sky-100 dark:bg-sky-950/60' },
                { label: 'Pending HR Reviews', value: '19',  icon: Clock,      color: 'text-amber-500',  bg: 'bg-amber-100 dark:bg-amber-950/60' },
                { label: 'HR Verif. Pending', value: '6',   icon: UserCheck,  color: 'text-rose-500',   bg: 'bg-rose-100 dark:bg-rose-950/60' },
                { label: 'Open Complaints', value: '3',     icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-950/60' },
                { label: 'Avg. Resume Score', value: '71%', icon: BarChart3,  color: 'text-teal-500',   bg: 'bg-teal-100 dark:bg-teal-950/60' },
                { label: 'Avg. HR Rating', value: '4.7',   icon: Star,       color: 'text-amber-500',  bg: 'bg-amber-100 dark:bg-amber-950/60' },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="rounded-2xl bg-card border px-4 py-3.5 flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-4 w-4 ${s.color}`} />
                    </div>
                    <div>
                      <p className="text-xl font-bold leading-none">{s.value}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue sparkline */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Revenue Trend</p>
            <div className="rounded-2xl bg-card border px-5 py-5 flex flex-col gap-4 h-[calc(100%-28px)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Daily Revenue (15d)</p>
                  <p className="text-2xl font-bold mt-0.5">$102 <span className="text-sm font-normal text-muted-foreground">today</span></p>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  +34%
                </div>
              </div>
              {/* Sparkline bars */}
              <div className="flex items-end gap-1 flex-1 min-h-[80px]">
                {SPARKLINE.map((v, i) => {
                  const maxV = Math.max(...SPARKLINE);
                  const h = Math.round((v / maxV) * 100);
                  const isLast = i === SPARKLINE.length - 1;
                  const isHigh = v >= 88;
                  return (
                    <div key={i} className="flex-1 flex flex-col justify-end h-full">
                      <div
                        className="rounded-sm w-full transition-all"
                        style={{
                          height: `${h}%`,
                          background: isLast
                            ? 'hsl(var(--primary))'
                            : isHigh
                            ? 'hsl(var(--primary) / 0.45)'
                            : 'hsl(var(--primary) / 0.18)',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Mar 8</span>
                <div className="flex items-center gap-1">
                  <RefreshCw className="h-2.5 w-2.5" />
                  <span>Static demo</span>
                </div>
                <span>Mar 22</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
