import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { OverviewContent } from '@/types/resume';

interface Props {
  value: OverviewContent;
  onChange: (value: OverviewContent) => void;
}

export default function OverviewForm({ value, onChange }: Props) {
  const { t } = useTranslation();

  const set = (key: keyof OverviewContent, val: string) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="space-y-4">
      <Field label={t('resume.form.fullName')}>
        <Input
          placeholder="John Doe"
          value={value.fullName}
          onChange={(e) => set('fullName', e.target.value)}
        />
      </Field>
      <Field label={t('resume.form.jobTitle')}>
        <Input
          placeholder="Software Engineer"
          value={value.title}
          onChange={(e) => set('title', e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('resume.form.email')}>
          <Input
            type="email"
            placeholder="john@example.com"
            value={value.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </Field>
        <Field label={t('resume.form.phone')}>
          <Input
            placeholder="+1 234 567 890"
            value={value.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
        </Field>
        <Field label={t('resume.form.location')}>
          <Input
            placeholder="New York, USA"
            value={value.location}
            onChange={(e) => set('location', e.target.value)}
          />
        </Field>
        <Field label={t('resume.form.website')}>
          <Input
            placeholder="https://yoursite.com"
            value={value.website}
            onChange={(e) => set('website', e.target.value)}
          />
        </Field>
      </div>
      <Field label={t('resume.form.summary')}>
        <Textarea
          placeholder="A passionate software engineer with 5+ years of experience..."
          rows={4}
          value={value.summary}
          onChange={(e) => set('summary', e.target.value)}
        />
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
