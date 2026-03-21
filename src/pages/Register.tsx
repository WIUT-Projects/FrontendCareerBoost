import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function RegisterPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-gradient-primary">CareerBoost Pro</h1>
          <p className="text-muted-foreground mt-2">{t('auth.createAccount')}</p>
        </div>
        <div className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
          <div>
            <Label htmlFor="name">{t('auth.fullName')}</Label>
            <Input id="name" placeholder="John Doe" />
          </div>
          <div>
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div>
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input id="password" type="password" placeholder="8+ characters" />
          </div>
          <div>
            <Label>{t('auth.iAmA')}</Label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <Button variant="outline" className="border-primary/30">{t('auth.jobSeeker')}</Button>
              <Button variant="outline">{t('auth.hrExpert')}</Button>
            </div>
          </div>
          <Button className="w-full">{t('auth.createBtn')}</Button>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-6">
          {t('auth.hasAccount')} <Link to="/login" className="text-primary font-medium hover:underline">{t('nav.signIn')}</Link>
        </p>
      </div>
    </div>
  );
}
