import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { Briefcase, Users, Chrome, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL;
const AUTH_GOOGLE = import.meta.env.VITE_API_AUTH_GOOGLE;

type Role = 'JobSeeker' | 'HrExpert';

export default function RegisterPage() {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleContinue = () => {
    if (!selectedRole) return;
    window.location.href = `${API_URL}${AUTH_GOOGLE}?role=${selectedRole}`;
  };

  const roles: { value: Role; icon: React.ElementType; label: string; desc: string }[] = [
    { value: 'JobSeeker', icon: Briefcase, label: t('auth.jobSeeker'), desc: t('auth.jobSeekerDesc') },
    { value: 'HrExpert', icon: Users, label: t('auth.hrExpert'), desc: t('auth.hrExpertDesc') },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-gradient-primary">CareerBoost Pro</h1>
          <p className="text-muted-foreground mt-2">{t('auth.chooseRole')}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('auth.chooseRoleSubtitle')}</p>
        </div>

        <div className="space-y-3 mb-6">
          {roles.map(({ value, icon: Icon, label, desc }) => (
            <button
              key={value}
              onClick={() => setSelectedRole(value)}
              className={cn(
                'w-full text-left rounded-xl border bg-card p-4 flex items-center gap-4 transition-all',
                'hover:border-primary/60 hover:bg-accent/50',
                selectedRole === value
                  ? 'border-primary ring-2 ring-primary/20 bg-accent/50'
                  : 'border-border'
              )}
            >
              <div className={cn(
                'h-11 w-11 rounded-lg flex items-center justify-center shrink-0',
                selectedRole === value ? 'bg-primary text-primary-foreground' : 'bg-accent text-primary'
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        <Button
          className="w-full h-11 gap-2"
          onClick={handleContinue}
          disabled={!selectedRole}
        >
          <Chrome className="h-4 w-4" />
          {t('auth.continueWithGoogle')}
          <ArrowRight className="h-4 w-4 ml-auto" />
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">{t('nav.signIn')}</Link>
        </p>
      </div>
    </div>
  );
}
