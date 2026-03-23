import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  User, Lock, Briefcase, Eye, EyeOff,
  Save, Loader2, Upload, X, Camera,
  CheckCircle2, Circle, ShieldCheck, Sparkles,
} from 'lucide-react';
import * as authService from '@/services/authService';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL ?? '';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function PasswordStrength({ pwd }: { pwd: string }) {
  const rules = [
    { ok: pwd.length >= 8,           label: 'At least 8 characters' },
    { ok: /[A-Z]/.test(pwd),         label: 'One uppercase letter' },
    { ok: /[a-z]/.test(pwd),         label: 'One lowercase letter' },
    { ok: /[0-9]/.test(pwd),         label: 'One digit' },
    { ok: /[^a-zA-Z0-9]/.test(pwd),  label: 'One special character' },
  ];
  const score = rules.filter(r => r.ok).length;
  const pct   = (score / rules.length) * 100;
  const color  = score <= 2 ? 'bg-destructive' : score <= 3 ? 'bg-yellow-500' : score <= 4 ? 'bg-blue-500' : 'bg-green-500';
  const label  = score <= 2 ? 'Weak' : score <= 3 ? 'Fair' : score <= 4 ? 'Good' : 'Strong';

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Password strength</span>
        <span className={cn(
          'font-medium',
          score <= 2 ? 'text-destructive' : score <= 3 ? 'text-yellow-500' : score <= 4 ? 'text-blue-500' : 'text-green-500',
        )}>{label}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
        {rules.map(r => (
          <li key={r.label} className={cn('flex items-center gap-1.5 text-xs', r.ok ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground')}>
            {r.ok ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <Circle className="h-3 w-3 shrink-0" />}
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PasswordInput({
  id, value, onChange, placeholder,
}: { id: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

// ─── Avatar Drop Zone ─────────────────────────────────────────────────────────

function AvatarDropZone({
  previewUrl, uploading, onFile, onClear,
}: {
  previewUrl: string;
  uploading: boolean;
  onFile: (f: File) => void;
  onClear: () => void;
}) {
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onFile(file);
  }, [onFile]);

  return (
    <div
      className={cn(
        'relative group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer select-none overflow-hidden',
        drag ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50 hover:bg-accent/30',
        'h-36 w-full',
      )}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      onClick={() => fileRef.current?.click()}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
      />

      {previewUrl ? (
        <>
          <img src={previewUrl} alt="avatar" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-white text-xs font-medium">
              <Camera className="h-3.5 w-3.5" /> Change photo
            </div>
          </div>
          {!uploading && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onClear(); }}
              className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors z-10"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 pointer-events-none">
          <div className={cn(
            'h-12 w-12 rounded-full border-2 flex items-center justify-center transition-colors',
            drag ? 'border-primary bg-primary/10 text-primary' : 'border-dashed border-muted-foreground/40 text-muted-foreground',
          )}>
            <Upload className="h-5 w-5" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Drop your photo here</p>
            <p className="text-xs text-muted-foreground mt-0.5">or click to browse · PNG, JPG, WebP</p>
          </div>
        </div>
      )}

      {uploading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <Loader2 className="h-6 w-6 text-white animate-spin" />
        </div>
      )}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ icon: Icon, title, desc, children }: {
  icon: React.ElementType;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="px-6 py-5 border-b bg-gradient-to-r from-muted/30 to-transparent flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="h-4.5 w-4.5 text-primary" style={{ height: '1.125rem', width: '1.125rem' }} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground leading-tight">{title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

// ─── Left navigation ──────────────────────────────────────────────────────────

function SettingsNav({ active, onChange, isHr }: { active: string; onChange: (v: string) => void; isHr: boolean }) {
  const { t } = useTranslation();
  const items = [
    { id: 'profile',  icon: User,       label: t('settings.tabProfile') },
    { id: 'security', icon: ShieldCheck, label: t('settings.tabSecurity') },
    ...(isHr ? [{ id: 'hr', icon: Briefcase, label: t('settings.tabHrProfile') }] : []),
  ];
  return (
    <nav className="flex flex-col gap-1">
      {items.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
            active === id
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/60',
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </button>
      ))}
    </nav>
  );
}

// ─── Profile tab ──────────────────────────────────────────────────────────────

function ProfileContent() {
  const { t } = useTranslation();
  const { profile, session, signIn } = useAuth();
  const { toast } = useToast();

  const [fullName,  setFullName]  = useState(profile?.fullName ?? '');
  const [bio,       setBio]       = useState('');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? '');
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);

  // Load latest bio from backend (not stored in local session)
  useEffect(() => {
    if (!session?.access_token) return;
    authService.getMe(session.access_token)
      .then(u => { setBio(u.bio ?? ''); })
      .catch(() => {});
  }, [session?.access_token]);

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  // Upload file → /api/files/upload?folder=avatars
  const handleFile = async (file: File) => {
    if (!session?.access_token) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_URL}/api/files/upload?folder=avatars`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: form,
      });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json() as { url: string };
      // Backend returns relative path like /files/avatars/xxx.jpg — prepend the API domain
      setAvatarUrl(`${API_URL}${url}`);
    } catch {
      toast({ title: 'Failed to upload image.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!session?.access_token) return;
    setSaving(true);
    try {
      await authService.updateProfile(session.access_token, {
        fullName: fullName || undefined,
        bio: bio || undefined,
        avatarUrl: avatarUrl || undefined,
      });

      const updatedUser = await authService.getMe(session.access_token);
      const stored = authService.loadSession();
      if (stored) {
        const next = {
          ...stored,
          profile: {
            ...stored.profile,
            fullName: updatedUser.fullName ?? fullName,
            avatarUrl: (updatedUser.avatarUrl ?? avatarUrl) || undefined,
          },
        };
        authService.saveSession(next);
        signIn(next);
      }

      toast({ title: t('settings.profileSaved') });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : t('settings.profileError'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section icon={User} title={t('settings.profileInfo')} desc={t('settings.profileInfoDesc')}>
      {/* Avatar */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t('settings.avatarUrl')}</Label>
        <AvatarDropZone
          previewUrl={avatarUrl}
          uploading={uploading}
          onFile={handleFile}
          onClear={() => setAvatarUrl('')}
        />
      </div>

      {/* Full name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">{t('settings.fullName')}</Label>
          <Input
            id="fullName"
            placeholder={t('settings.fullNamePlaceholder')}
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input
            value={profile?.email ?? ''}
            disabled
            className="bg-muted/50 text-muted-foreground cursor-not-allowed"
          />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <Label htmlFor="bio">{t('settings.bio')}</Label>
        <Textarea
          id="bio"
          rows={3}
          placeholder={t('settings.bioPlaceholder')}
          value={bio}
          onChange={e => setBio(e.target.value)}
          className="resize-none"
        />
      </div>

      <div className="flex justify-end pt-1 border-t">
        <Button onClick={handleSave} disabled={saving || uploading} className="gap-2 mt-4">
          {saving
            ? <><Loader2 className="h-4 w-4 animate-spin" />{t('settings.savingProfile')}</>
            : <><Save className="h-4 w-4" />{t('settings.saveProfile')}</>}
        </Button>
      </div>
    </Section>
  );
}

// ─── Security tab ─────────────────────────────────────────────────────────────

function SecurityContent() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const { toast } = useToast();

  const [oldPassword,     setOldPassword]     = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving,          setSaving]          = useState(false);

  const mismatch = confirmPassword !== '' && confirmPassword !== newPassword;
  const canSubmit = newPassword.length >= 8 && !mismatch && !saving;

  const handleChange = async () => {
    if (!session?.access_token) return;
    setSaving(true);
    try {
      await authService.changePassword(session.access_token, {
        oldPassword: oldPassword || undefined,
        newPassword,
        confirmPassword,
      });
      toast({ title: t('settings.passwordChanged') });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : t('settings.passwordError'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section icon={ShieldCheck} title={t('settings.security')} desc={t('settings.securityDesc')}>
      {/* Google account hint */}
      <div className="flex items-start gap-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-4 py-3">
        <Sparkles className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300">{t('settings.noPasswordHint')}</p>
      </div>

      {/* Current password */}
      <div className="space-y-1.5">
        <Label htmlFor="oldPassword">{t('settings.oldPassword')}</Label>
        <PasswordInput
          id="oldPassword"
          value={oldPassword}
          onChange={setOldPassword}
          placeholder={t('settings.oldPasswordPlaceholder')}
        />
        <p className="text-xs text-muted-foreground">Leave blank if you signed up with Google.</p>
      </div>

      <div className="h-px bg-border" />

      {/* New password */}
      <div className="space-y-1.5">
        <Label htmlFor="newPassword">{t('settings.newPassword')}</Label>
        <PasswordInput
          id="newPassword"
          value={newPassword}
          onChange={setNewPassword}
          placeholder={t('settings.newPasswordPlaceholder')}
        />
        {newPassword && <PasswordStrength pwd={newPassword} />}
      </div>

      {/* Confirm */}
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">{t('settings.confirmPassword')}</Label>
        <PasswordInput
          id="confirmPassword"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder={t('settings.confirmPasswordPlaceholder')}
        />
        {mismatch && <p className="text-xs text-destructive mt-1">Passwords do not match.</p>}
        {!mismatch && confirmPassword && (
          <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
            <CheckCircle2 className="h-3 w-3" /> Passwords match
          </p>
        )}
      </div>

      <div className="flex justify-end pt-1 border-t">
        <Button onClick={handleChange} disabled={!canSubmit} className="gap-2 mt-4">
          {saving
            ? <><Loader2 className="h-4 w-4 animate-spin" />{t('settings.changingPassword')}</>
            : <><Lock className="h-4 w-4" />{t('settings.changePassword')}</>}
        </Button>
      </div>
    </Section>
  );
}

// ─── HR Profile tab ───────────────────────────────────────────────────────────

function HrProfileContent() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const { toast } = useToast();

  const [headline,        setHeadline]        = useState('');
  const [specializations, setSpecializations] = useState('');
  const [yearsExp,        setYearsExp]        = useState('');
  const [reviewPrice,     setReviewPrice]     = useState('');
  const [saving,          setSaving]          = useState(false);
  const [loadingProfile,  setLoadingProfile]  = useState(true);

  // Load existing HR profile on mount
  useEffect(() => {
    if (!session?.access_token) { setLoadingProfile(false); return; }
    authService.getHrExpertProfile(session.access_token)
      .then(data => {
        if (data) {
          setHeadline(data.headline ?? '');
          setSpecializations(data.specializations ?? '');
          setYearsExp(data.yearsExp != null ? String(data.yearsExp) : '');
          setReviewPrice(data.reviewPriceUzs != null ? String(data.reviewPriceUzs) : '');
        }
      })
      .catch(() => {/* silently ignore — no profile yet */})
      .finally(() => setLoadingProfile(false));
  }, [session?.access_token]);

  const handleSave = async () => {
    if (!session?.access_token) return;
    setSaving(true);
    try {
      await authService.updateHrExpertProfile(session.access_token, {
        headline: headline || undefined,
        specializations: specializations || undefined,
        yearsExp: yearsExp ? Number(yearsExp) : undefined,
        reviewPriceUzs: reviewPrice ? Number(reviewPrice) : undefined,
      });
      toast({ title: t('settings.hrProfileSaved') });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : t('settings.hrProfileError'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const chips = specializations
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (loadingProfile) {
    return (
      <div className="rounded-2xl border bg-card p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Section icon={Briefcase} title={t('settings.hrProfile')} desc={t('settings.hrProfileDesc')}>
      {/* Headline */}
      <div className="space-y-1.5">
        <Label htmlFor="headline">{t('settings.headline')}</Label>
        <Input
          id="headline"
          placeholder={t('settings.headlinePlaceholder')}
          value={headline}
          onChange={e => setHeadline(e.target.value)}
        />
      </div>

      {/* Specializations */}
      <div className="space-y-1.5">
        <Label htmlFor="specializations">{t('settings.specializations')}</Label>
        <Input
          id="specializations"
          placeholder={t('settings.specializationsPlaceholder')}
          value={specializations}
          onChange={e => setSpecializations(e.target.value)}
        />
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {chips.map(c => (
              <Badge key={c} variant="secondary" className="rounded-full text-xs font-normal">{c}</Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">{t('settings.specializationsHint')}</p>
      </div>

      {/* Years + Price */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="yearsExp">{t('settings.yearsExp')}</Label>
          <Input
            id="yearsExp"
            type="number"
            min={0} max={60}
            placeholder={t('settings.yearsExpPlaceholder')}
            value={yearsExp}
            onChange={e => setYearsExp(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reviewPrice">{t('settings.reviewPrice')}</Label>
          <div className="relative">
            <Input
              id="reviewPrice"
              type="number"
              min={0}
              placeholder={t('settings.reviewPricePlaceholder')}
              value={reviewPrice}
              onChange={e => setReviewPrice(e.target.value)}
              className="pr-14"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">UZS</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-1 border-t">
        <Button onClick={handleSave} disabled={saving} className="gap-2 mt-4">
          {saving
            ? <><Loader2 className="h-4 w-4 animate-spin" />{t('settings.savingProfile')}</>
            : <><Save className="h-4 w-4" />{t('settings.saveHrProfile')}</>}
        </Button>
      </div>
    </Section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfileSettingsPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [tab, setTab] = useState('profile');

  const isHr = profile?.role === 'hr_expert';

  const initials = profile?.fullName
    ? profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const roleBadge = isHr ? 'HR Expert' : profile?.role === 'admin' ? 'Admin' : 'Job Seeker';

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-display">{t('settings.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('settings.subtitle')}</p>
        </div>

        <div className="flex gap-6 items-start">
          {/* ─── Left sidebar ─── */}
          <aside className="w-56 shrink-0 space-y-4 sticky top-4">
            {/* User card */}
            <div className="rounded-2xl border bg-card p-4 flex flex-col items-center text-center gap-3">
              <div className="h-16 w-16 rounded-2xl overflow-hidden ring-2 ring-primary/20 bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                {profile?.avatarUrl
                  ? <img src={profile.avatarUrl} alt={profile.fullName} className="h-full w-full object-cover" />
                  : <span className="text-primary-foreground text-xl font-bold">{initials}</span>
                }
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold leading-tight truncate max-w-full">{profile?.fullName || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate max-w-full">{profile?.email}</p>
                <Badge variant="secondary" className="text-xs rounded-full mt-1">{roleBadge}</Badge>
              </div>
            </div>

            {/* Nav */}
            <SettingsNav active={tab} onChange={setTab} isHr={isHr} />
          </aside>

          {/* ─── Right content ─── */}
          <div className="flex-1 min-w-0">
            {tab === 'profile'  && <ProfileContent />}
            {tab === 'security' && <SecurityContent />}
            {tab === 'hr'       && isHr && <HrProfileContent />}
          </div>
        </div>
      </div>
    </div>
  );
}
