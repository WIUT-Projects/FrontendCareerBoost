import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import {
  Briefcase, Users, Chrome, ArrowRight,
  CheckCircle2, FileText, Brain, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL;
const AUTH_GOOGLE = import.meta.env.VITE_API_AUTH_GOOGLE;

type Role = 'JobSeeker' | 'HrExpert';

// ── Feature list for left panel (will be localized in component) ──────────────
const FEATURES_CONFIG = [
  { icon: FileText,    key: 'aiResumeBuild' },
  { icon: Brain,       key: 'atsScoring'    },
  { icon: ShieldCheck, key: 'hrCoaching'    },
];

// ── Decorative blobs (CSS-only, no deps) ─────────────────────────────────────
function Blob({ className }: { className: string }) {
  return (
    <div
      className={cn(
        'absolute rounded-full blur-3xl pointer-events-none',
        className,
      )}
    />
  );
}

export default function RegisterPage() {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleContinue = () => {
    if (!selectedRole) return;
    window.location.href = `${API_URL}${AUTH_GOOGLE}?role=${selectedRole}`;
  };

  const roles: { value: Role; icon: React.ElementType; label: string; desc: string }[] = [
    { value: 'JobSeeker', icon: Briefcase, label: t('auth.jobSeeker'), desc: t('auth.jobSeekerDesc') },
    { value: 'HrExpert',  icon: Users,     label: t('auth.hrExpert'),  desc: t('auth.hrExpertDesc')  },
  ];

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── Left panel — dark branding ──────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden bg-[#0f0f14]">
        {/* Ambient blobs */}
        <Blob className="w-[420px] h-[420px] bg-violet-600/25 -top-32 -left-28" />
        <Blob className="w-[320px] h-[320px] bg-indigo-500/20 bottom-0 right-0 translate-x-1/3 translate-y-1/3" />
        <Blob className="w-[200px] h-[200px] bg-sky-500/15 top-1/2 left-1/3" />

        {/* Grid texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Briefcase className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">CareerBoost</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
            Pro
          </span>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-400 uppercase tracking-widest">
              <span className="h-px w-6 bg-violet-500" />
              {t('auth.aiCareerPlatform')}
            </div>
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight">
              {t('auth.landDream')}{' '}
              <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-sky-400 bg-clip-text text-transparent">
                .
              </span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              {t('auth.buildResumes')}
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3.5">
            {FEATURES_CONFIG.map((f, i) => {
              const Icon = f.icon;
              return (
                <li key={i} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="h-3.5 w-3.5 text-violet-400" />
                  </div>
                  <span className="text-slate-300 text-sm leading-relaxed">{t(`auth.${f.key}`)}</span>
                </li>
              );
            })}
          </ul>

          {/* Social proof */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex -space-x-2.5">
              {['#7c3aed','#2563eb','#059669','#d97706'].map((c, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-[#0f0f14] flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: c }}
                >
                  {['A','B','C','D'][i]}
                </div>
              ))}
            </div>
            <div>
              <div className="text-white text-sm font-semibold">{t('auth.professionals')}</div>
              <div className="text-slate-500 text-xs">{t('auth.boostingCareers')}</div>
            </div>
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 border border-white/10 rounded-2xl p-5 bg-white/5 backdrop-blur-sm">
          <p className="text-slate-300 text-sm leading-relaxed italic">
            "{t('auth.testimonialText')}"
          </p>
          <div className="flex items-center gap-2.5 mt-3">
            <div className="h-7 w-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
              T
            </div>
            <div>
              <p className="text-white text-xs font-semibold">{t('auth.testimonialAuthor')}</p>
              <p className="text-slate-500 text-[11px]">{t('auth.testimonialRole')}</p>
            </div>
            <div className="ml-auto flex gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <svg key={s} className="h-3 w-3 fill-amber-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.168c.969 0 1.371 1.24.588 1.81l-3.375 2.452a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.375-2.452a1 1 0 00-1.175 0l-3.375 2.452c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.168a1 1 0 00.95-.69L9.05 2.927z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col">

        {/* Top bar: lang + theme */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Briefcase className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">CareerBoost Pro</span>
          </div>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        {/* Form content — centered */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[400px] space-y-7">

            {/* Heading */}
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight">
                {t('auth.chooseRole')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t('auth.chooseRoleSubtitle')}
              </p>
            </div>

            {/* Role cards */}
            <div className="space-y-3">
              {roles.map(({ value, icon: Icon, label, desc }) => {
                const active = selectedRole === value;
                return (
                  <button
                    key={value}
                    onClick={() => setSelectedRole(value)}
                    className={cn(
                      'w-full text-left rounded-2xl border-2 p-4 flex items-center gap-4 transition-all duration-150',
                      'hover:border-primary/50 hover:bg-accent/30',
                      active
                        ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                        : 'border-border bg-card',
                    )}
                  >
                    <div className={cn(
                      'h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                        : 'bg-muted text-muted-foreground',
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{desc}</p>
                    </div>
                    {active && (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-background text-xs text-muted-foreground">
                  {t('auth.otherOptions')}
                </span>
              </div>
            </div>

            {/* Google button */}
            <Button
              className="w-full h-11 gap-2 text-sm font-semibold rounded-xl"
              onClick={handleContinue}
              disabled={!selectedRole}
            >
              <Chrome className="h-4 w-4" />
              {t('auth.continueWithGoogle')}
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>

            {/* Terms note */}
            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              By continuing, you agree to our{' '}
              <span className="text-foreground font-medium cursor-pointer hover:underline">{t('auth.termsOfService')}</span>{' '}
              and{' '}
              <span className="text-foreground font-medium cursor-pointer hover:underline">{t('auth.privacyPolicy')}</span>.
            </p>

            {/* Sign in link */}
            <p className="text-center text-sm text-muted-foreground">
              {t('auth.hasAccount')}{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                {t('nav.signIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
