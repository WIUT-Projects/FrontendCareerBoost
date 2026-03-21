import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { Chrome, ShieldCheck } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const AUTH_GOOGLE = import.meta.env.VITE_API_AUTH_GOOGLE;

export default function LoginPage() {
  const { isAuthenticated, profile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (isAuthenticated && profile) {
      if (profile.role === 'hr_expert') navigate('/hr-portal');
      else navigate('/dashboard');
    }
  }, [isAuthenticated, profile, navigate]);

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}${AUTH_GOOGLE}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-gradient-primary">CareerBoost Pro</h1>
          <p className="text-muted-foreground mt-2">{t('auth.signInTitle')}</p>
        </div>
        <div className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
          <Button
            className="w-full h-12 text-base gap-3"
            variant="outline"
            onClick={handleGoogleLogin}
          >
            <Chrome className="h-5 w-5" />
            {t('auth.signInWithGoogle')}
          </Button>
        </div>

        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            {t('auth.noAccount')}{' '}
            <a href="/register" className="text-primary font-medium hover:underline">{t('auth.register')}</a>
          </p>
          <a href="/admin/login" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            {t('auth.adminLogin')}
          </a>
        </div>
      </div>
    </div>
  );
}
