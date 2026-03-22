import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Palette, Brain, Users, Briefcase, Calendar,
  ArrowRight, Sparkles, Crown, MessageSquare, Zap, Target,
  TrendingUp, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getMySubscriptionStatus } from '@/services/subscriptionService';

const DashboardPage = () => {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const firstName = profile?.fullName?.split(' ')[0] || '';
  const [currentPlan, setCurrentPlan] = useState('Free');

  useEffect(() => {
    getMySubscriptionStatus()
      .then((s) => setCurrentPlan(s.planName))
      .catch(() => null);
  }, []);

  const quickLinks = [
    { icon: FileText, label: t('sidebar.myResumes'), url: '/resumes', count: 3 },
    { icon: Briefcase, label: t('sidebar.jobs'), url: '/jobs', count: 128 },
    { icon: Calendar, label: t('sidebar.interviews'), url: '/interviews', count: 2 },
    { icon: MessageSquare, label: t('sidebar.messages'), url: '/messages', count: 5 },
  ];

  const tools = [
    { icon: Palette, label: t('sidebar.templates'), desc: '50+ premium', url: '/templates' },
    { icon: Users, label: t('sidebar.hrExperts'), desc: '24 experts', url: '/hr' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero welcome */}
      <div className="relative overflow-hidden rounded-2xl border bg-card p-6 md:p-8">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="font-display text-xl md:text-2xl font-bold">
              {t('dashboard.welcome', { name: firstName })}
            </h1>
            <Badge
              variant="outline"
              className="cursor-pointer border-primary/30 text-primary text-[10px] px-2 py-0 h-5 hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => navigate('/settings/subscription')}
            >
              <Crown className="h-2.5 w-2.5 mr-0.5" />
              {currentPlan}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{t('dashboard.subtitle')}</p>

          {/* Quick stat pills */}
          <div className="flex flex-wrap gap-2 mt-5">
            {quickLinks.map((link) => (
              <button
                key={link.url}
                onClick={() => navigate(link.url)}
                className="group inline-flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur-sm pl-1 pr-3.5 py-1 text-xs hover:border-primary/30 hover:bg-accent/50 transition-all"
              >
                <span className="h-6 w-6 rounded-full bg-accent flex items-center justify-center">
                  <link.icon className="h-3 w-3 text-accent-foreground" />
                </span>
                <span className="font-medium">{link.label}</span>
                <span className="text-muted-foreground font-mono">{link.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: AI tools */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Tools</h2>
          </div>

          {/* AI Analysis card */}
          <button
            onClick={() => navigate('/ai-analysis')}
            className="group w-full relative overflow-hidden rounded-xl border border-primary/15 p-5 text-left transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/15 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/5 blur-2xl animate-[pulse_6s_ease-in-out_infinite]" />
            <div className="relative flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-sm">{t('sidebar.aiAnalysis')}</h3>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Get AI-powered scoring, keyword optimization & improvement tips for your resumes</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-background/60 rounded-full px-2 py-0.5">
                    <Target className="h-2.5 w-2.5" /> ATS Score
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-background/60 rounded-full px-2 py-0.5">
                    <TrendingUp className="h-2.5 w-2.5" /> Suggestions
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* AI Optimizer card */}
          <button
            onClick={() => navigate('/ai-analysis')}
            className="group w-full relative overflow-hidden rounded-xl border border-primary/15 p-5 text-left transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-primary/10 opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-accent/15 blur-2xl animate-[pulse_8s_ease-in-out_infinite_2s]" />
            <div className="relative flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary-dark flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-sm">AI Resume Optimizer</h3>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Auto-enhance content, fix grammar, and optimize for job descriptions</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-background/60 rounded-full px-2 py-0.5">
                    <Clock className="h-2.5 w-2.5" /> Instant
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-background/60 rounded-full px-2 py-0.5">
                    <Sparkles className="h-2.5 w-2.5" /> Smart
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Right: Tools + Upgrade */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">Explore</h2>
          </div>

          {tools.map((tool) => (
            <button
              key={tool.url}
              onClick={() => navigate(tool.url)}
              className="group w-full flex items-center gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:shadow-sm hover:border-border/80"
            >
              <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <tool.icon className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-sm">{tool.label}</h3>
                <p className="text-[11px] text-muted-foreground">{tool.desc}</p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}

          {/* Upgrade card */}
          {currentPlan === 'Free' && (
            <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Crown className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm">Go Pro</h3>
                  <p className="text-[11px] text-muted-foreground">$12/mo</p>
                </div>
              </div>
              <ul className="space-y-1 mb-3">
                {['Unlimited AI', 'HR reviews', 'Premium templates'].map((f) => (
                  <li key={f} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                size="sm"
                onClick={() => navigate('/settings/subscription')}
                className="w-full rounded-lg h-8 text-xs"
              >
                View Plans <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
