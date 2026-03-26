import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Palette, Brain, Users, Briefcase, Calendar,
  ArrowRight, Sparkles, Crown, MessageSquare, Zap, Target,
  TrendingUp, Clock, CheckCircle2, ChevronRight,
  PenLine, UserCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SubscriptionPlanType } from '@/services/subscriptionService';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useRecentResumes } from '@/hooks/useRecentResumes';

// Helper to convert enum to readable string
function getPlanTypeName(planType: SubscriptionPlanType): string {
  const names: Record<SubscriptionPlanType, string> = {
    [SubscriptionPlanType.Free]: 'Free',
    [SubscriptionPlanType.Pro]: 'Pro',
    [SubscriptionPlanType.Business]: 'Business',
  };
  return names[planType] || 'Free';
}


// ── score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" className="flex-shrink-0 -rotate-90">
      <circle cx="30" cy="30" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
      <circle cx="30" cy="30" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      <text x="30" y="34" textAnchor="middle" fontSize="13" fontWeight="700"
        fill="currentColor" className="text-foreground"
        style={{ transform: 'rotate(90deg)', transformOrigin: '30px 30px' }}>
        {score}
      </text>
    </svg>
  );
}

// ── main ─────────────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const firstName = profile?.fullName?.split(' ')[0] || 'Foydalanuvchi';
  const { data: subStatus } = useSubscriptionStatus();
  const currentPlan = getPlanTypeName(subStatus?.planType ?? SubscriptionPlanType.Free);
  const isPro = currentPlan !== 'Free';
  const { data: recentResumes = [], isLoading: resumesLoading } = useRecentResumes();

  return (
    <div className="min-h-full bg-muted/30 py-6">
      <div className="max-w-6xl mx-auto px-6 space-y-6">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border bg-card">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-accent/15 blur-2xl pointer-events-none" />

          <div className="relative px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-xl md:text-2xl font-bold">
                  {t('dashboard.welcome', { name: firstName })} 👋
                </h1>
                <Badge
                  variant="outline"
                  className={`cursor-pointer text-[10px] px-2 py-0 h-5 transition-colors ${
                    isPro
                      ? 'border-amber-400/40 text-amber-500 hover:bg-amber-500 hover:text-white'
                      : 'border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground'
                  }`}
                  onClick={() => navigate('/settings/subscription')}
                >
                  <Crown className="h-2.5 w-2.5 mr-0.5" />
                  {currentPlan}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{t('dashboard.subtitle')}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { icon: FileText,      label: t('sidebar.myResumes'), url: '/resumes',    count: 3,   bg: 'bg-blue-500' },
                { icon: Briefcase,     label: t('sidebar.jobs'),       url: '/jobs',       count: 128, bg: 'bg-violet-500' },
                { icon: Calendar,      label: t('sidebar.interviews'), url: '/interviews', count: 2,   bg: 'bg-emerald-500' },
                { icon: MessageSquare, label: t('sidebar.messages'),   url: '/messages',   count: 5,   bg: 'bg-amber-500' },
              ].map((link) => (
                <button
                  key={link.url}
                  onClick={() => navigate(link.url)}
                  className="group inline-flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur-sm pl-1 pr-3.5 py-1 text-xs hover:border-primary/30 hover:bg-accent/50 transition-all"
                >
                  <span className={`h-6 w-6 rounded-full ${link.bg} flex items-center justify-center`}>
                    <link.icon className="h-3 w-3 text-white" />
                  </span>
                  <span className="font-medium">{link.label}</span>
                  <span className="font-mono text-muted-foreground">{link.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── LEFT col ──────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Recent Resumes */}
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h2 className="font-display font-semibold text-sm">So'nggi resumelar</h2>
                </div>
                <button
                  onClick={() => navigate('/resumes')}
                  className="text-[11px] font-medium text-primary flex items-center gap-0.5 hover:underline"
                >
                  Barchasi <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="space-y-2">
                {resumesLoading ? (
                  // Loading skeleton
                  [1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border bg-muted/30 px-3.5 py-3 animate-pulse">
                      <div className="h-[60px] w-[60px] rounded-full bg-muted flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-muted rounded w-3/4" />
                        <div className="h-2.5 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : recentResumes.length === 0 ? (
                  // Empty state
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>{t('resume.noResumes')}</p>
                  </div>
                ) : (
                  recentResumes.map((resume) => (
                    <div
                      key={resume.id}
                      onClick={() => navigate(`/resumes/${resume.id}/edit`)}
                      className="group flex items-center gap-3 rounded-xl border bg-muted/30 hover:bg-accent/40 px-3.5 py-3 cursor-pointer transition-all"
                    >
                      {resume.aiScore !== null ? (
                        <ScoreRing score={resume.aiScore} />
                      ) : (
                        <div className="flex-shrink-0 h-[60px] w-[60px] rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                          <span className="text-[11px] text-muted-foreground">—</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{resume.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                          {resume.templateName && (
                            <span className="inline-flex items-center gap-1 bg-background rounded-full px-2 py-0.5 border">
                              <Palette className="h-2.5 w-2.5" /> {resume.templateName}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {new Date(resume.updatedAt ?? resume.createdAt).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/resumes/${resume.id}/edit`); }}
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] bg-background border rounded-lg px-2.5 py-1 hover:border-primary/40 transition-all"
                        >
                          <PenLine className="h-3 w-3" /> Edit
                        </button>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={() => navigate('/resumes/new')}
                className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed py-2.5 text-xs text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
              >
                <PenLine className="h-3.5 w-3.5" /> {t('resume.newResume')}
              </button>
            </div>

            {/* AI Tools */}
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-primary" />
                <h2 className="font-display font-semibold text-sm">AI Vositalar</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <button onClick={() => navigate('/ai-analysis')}
                  className="group relative overflow-hidden rounded-xl border border-primary/20 p-4 text-left transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/5">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/10 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
                      <Brain className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{t('sidebar.aiAnalysis')}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">AI orqali ATS balli, kalit so'zlar va tavsiyalar</p>
                    </div>
                    <div className="flex gap-2">
                      {['ATS Score', 'Suggestions'].map((tag) => (
                        <span key={tag} className="text-[10px] bg-background/80 border rounded-full px-2 py-0.5">{tag}</span>
                      ))}
                    </div>
                  </div>
                </button>

                <button onClick={() => navigate('/ai-analysis')}
                  className="group relative overflow-hidden rounded-xl border border-violet-500/20 p-4 text-left transition-all hover:border-violet-500/40 hover:shadow-md hover:shadow-violet-500/5">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 via-transparent to-indigo-500/10 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col gap-3">
                    <div className="h-10 w-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-sm shadow-violet-600/20">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">AI Optimizer</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Matnni yaxshilash, grammatika va vakansiyaga moslashtirish</p>
                    </div>
                    <div className="flex gap-2">
                      {['Instant', 'Smart'].map((tag) => (
                        <span key={tag} className="text-[10px] bg-background/80 border rounded-full px-2 py-0.5">{tag}</span>
                      ))}
                    </div>
                  </div>
                </button>

                <button onClick={() => navigate('/hr')}
                  className="group relative overflow-hidden rounded-xl border border-emerald-500/20 p-4 text-left transition-all hover:border-emerald-500/40 hover:shadow-md hover:shadow-emerald-500/5">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-transparent to-teal-500/10 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-600/20">
                      <UserCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">HR Ekspert</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Professional HR mutaxassislaridan shaxsiy maslahat</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[10px] bg-background/80 border rounded-full px-2 py-0.5">24 ta ekspert</span>
                      <span className="text-[10px] bg-background/80 border rounded-full px-2 py-0.5">★ 4.8</span>
                    </div>
                  </div>
                </button>

                <button onClick={() => navigate('/jobs')}
                  className="group relative overflow-hidden rounded-xl border border-sky-500/20 p-4 text-left transition-all hover:border-sky-500/40 hover:shadow-md hover:shadow-sky-500/5">
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-500/8 via-transparent to-blue-500/10 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col gap-3">
                    <div className="h-10 w-10 rounded-xl bg-sky-600 flex items-center justify-center shadow-sm shadow-sky-600/20">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Vakansiyalar</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Sizga mos ish o'rinlarini toping va ariza yuboring</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[10px] bg-background/80 border rounded-full px-2 py-0.5">128 ochiq</span>
                    </div>
                  </div>
                </button>

              </div>
            </div>
          </div>

          {/* ── RIGHT col ─────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Explore */}
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-display font-semibold text-sm">Explore</h2>
              </div>
              <div className="space-y-2">
                {[
                  { icon: Palette,    label: t('sidebar.templates'),  desc: '50+ premium shablon', url: '/templates',   color: 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600' },
                  { icon: Users,      label: t('sidebar.hrExperts'),  desc: '24 ta ekspert',       url: '/hr',          color: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600' },
                  { icon: TrendingUp, label: t('sidebar.aiAnalysis'), desc: 'AI tahlil',           url: '/ai-analysis', color: 'bg-amber-100 dark:bg-amber-950/50 text-amber-600' },
                ].map((tool) => (
                  <button
                    key={tool.url}
                    onClick={() => navigate(tool.url)}
                    className="group w-full flex items-center gap-3 rounded-xl border bg-muted/20 hover:bg-accent/40 px-3 py-2.5 text-left transition-all"
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tool.color}`}>
                      <tool.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs">{tool.label}</p>
                      <p className="text-[10px] text-muted-foreground">{tool.desc}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            {/* Upgrade card (free users only) */}
            {!isPro && (
              <div className="relative overflow-hidden rounded-2xl border border-primary/20 p-5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/10 pointer-events-none" />
                <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-sm shadow-primary/30">
                      <Crown className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Go Pro</p>
                      <p className="text-[11px] text-muted-foreground">$12/oy dan</p>
                    </div>
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    {['Cheksiz AI tahlil', 'Premium shablonlar', 'HR ekspert sessiyalari', 'Priority support'].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    onClick={() => navigate('/settings/subscription')}
                    className="w-full rounded-xl h-8 text-xs"
                  >
                    Rejalarni ko'rish <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
