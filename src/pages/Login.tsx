import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import {
  Chrome, Briefcase, ChevronDown,
  Mail, Lock, Loader2, AlertCircle, Eye, EyeOff,
  FileText, Brain, Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  userLogin, buildSession,
  getRedirectPathByRole,
} from '@/services/authService';

const API_URL = import.meta.env.VITE_API_URL;
const AUTH_GOOGLE = import.meta.env.VITE_API_AUTH_GOOGLE;

// ── Left panel features ───────────────────────────────────────────────────────
const FEATURES = [
  { icon: FileText, text: 'AI-powered resume builder with 6+ templates' },
  { icon: Brain,    text: 'Smart ATS scoring & keyword optimization'     },
  { icon: Users,    text: 'Verified HR experts for personal coaching'    },
];

function Blob({ className }: { className: string }) {
  return <div className={cn('absolute rounded-full blur-3xl pointer-events-none', className)} />;
}

// ── Email/password collapsed section ─────────────────────────────────────────
function EmailForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus email when expanded
    setTimeout(() => emailRef.current?.focus(), 120);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      const tokens = await userLogin(email, password);
      const session = await buildSession(tokens);
      signIn(session);   // updates React context + saves to localStorage
      navigate(getRedirectPathByRole(session.profile.role), { replace: true });
    } catch (err: any) {
      setError(err?.message ?? t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-1">
      {/* Email */}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={emailRef}
          type="email"
          placeholder={t('auth.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pl-9 h-11 rounded-xl"
          autoComplete="email"
          required
          title={t('auth.emailRequired')}
        />
      </div>

      {/* Password */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type={showPass ? 'text' : 'password'}
          placeholder={t('auth.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="pl-9 pr-10 h-11 rounded-xl"
          autoComplete="current-password"
          required
          title={t('auth.passwordRequired')}
        />
        <button
          type="button"
          onClick={() => setShowPass((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          title={showPass ? t('auth.hidePassword') : t('auth.showPassword')}
        >
          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xl px-3 py-2.5">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        className="w-full h-11 rounded-xl font-semibold"
        disabled={loading || !email || !password}
      >
        {loading
          ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('auth.signingIn')}</>
          : t('auth.signInBtn')}
      </Button>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const [emailOpen, setEmailOpen] = useState(false);

  useEffect(() => { signOut(); }, [signOut]);

  const handleGoogleLogin = () => {
    const url = AUTH_GOOGLE?.startsWith('http') ? AUTH_GOOGLE : `${API_URL}${AUTH_GOOGLE}`;
    window.location.href = url;
  };

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── Left panel ────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden bg-[#0f0f14]">
        <Blob className="w-[420px] h-[420px] bg-violet-600/25 -top-32 -left-28" />
        <Blob className="w-[320px] h-[320px] bg-indigo-500/20 bottom-0 right-0 translate-x-1/3 translate-y-1/3" />
        <Blob className="w-[200px] h-[200px] bg-sky-500/15 top-1/2 left-1/3" />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">CareerBoost</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
            Pro
          </span>
        </div>

        {/* Copy */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-400 uppercase tracking-widest">
              <span className="h-px w-6 bg-violet-500" />
              {t('auth.loginWelcome')}
            </div>
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight">
              {t('auth.continueCareer')}{' '}
              <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-sky-400 bg-clip-text text-transparent">
                .
              </span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              {t('auth.loginDescription')}
            </p>
          </div>

          <ul className="space-y-3.5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <li key={i} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="h-3.5 w-3.5 text-violet-400" />
                  </div>
                  <span className="text-slate-300 text-sm leading-relaxed">{f.text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Quote */}
        <div className="relative z-10 border border-white/10 rounded-2xl p-5 bg-white/5 backdrop-blur-sm">
          <p className="text-slate-300 text-sm leading-relaxed italic">
            "CareerBoost helped me land 3 interviews in a week. The AI score jumped from 54 to 89!"
          </p>
          <div className="flex items-center gap-2.5 mt-3">
            <div className="h-7 w-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
              T
            </div>
            <div>
              <p className="text-white text-xs font-semibold">Timur S.</p>
              <p className="text-slate-500 text-[11px]">Frontend Developer</p>
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

      {/* ── Right panel ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
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

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[400px] space-y-6">

            {/* Heading */}
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight">
                {t('auth.signInTitle')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t('auth.loginSubtitle')}
              </p>
            </div>

            {/* Google button — PRIMARY */}
            <Button
              className="w-full h-12 gap-3 text-sm font-semibold rounded-xl"
              onClick={handleGoogleLogin}
            >
              <Chrome className="h-4 w-4" />
              {t('auth.signInWithGoogle')}
            </Button>

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

            {/* Collapsed email/password toggle */}
            <div className="rounded-2xl border overflow-hidden">
              <button
                type="button"
                onClick={() => setEmailOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {t('auth.emailPassword')}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform duration-200',
                    emailOpen && 'rotate-180',
                  )}
                />
              </button>

              {/* Animated expand */}
              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: emailOpen ? '300px' : '0px', opacity: emailOpen ? 1 : 0 }}
              >
                <div className="px-4 pb-4 border-t bg-muted/20">
                  <div className="pt-4">
                    <EmailForm />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom links */}
            <p className="text-center text-sm text-muted-foreground">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                {t('auth.register')}
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
