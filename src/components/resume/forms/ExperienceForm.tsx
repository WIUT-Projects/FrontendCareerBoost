import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import type { ExperienceItem } from '@/types/resume';
import { nanoid } from 'nanoid';

interface Props {
  value: ExperienceItem[];
  onChange: (value: ExperienceItem[]) => void;
}

const EMPTY = (): ExperienceItem => ({
  id: nanoid(),
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  current: false,
  bullets: [''],
});

export default function ExperienceForm({ value, onChange }: Props) {
  const { t } = useTranslation();

  const add = () => onChange([...value, EMPTY()]);
  const remove = (id: string) => onChange(value.filter((e) => e.id !== id));
  const update = (id: string, patch: Partial<ExperienceItem>) =>
    onChange(value.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const setBullets = (id: string, raw: string) =>
    update(id, { bullets: raw.split('\n') });

  return (
    <div className="space-y-4">
      {value.map((item, idx) => (
        <div key={item.id} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">#{idx + 1}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={() => remove(item.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('resume.form.company')}>
              <Input
                placeholder="Google"
                value={item.company}
                onChange={(e) => update(item.id, { company: e.target.value })}
              />
            </Field>
            <Field label={t('resume.form.position')}>
              <Input
                placeholder="Software Engineer"
                value={item.position}
                onChange={(e) => update(item.id, { position: e.target.value })}
              />
            </Field>
            <Field label={t('resume.form.startDate')}>
              <Input
                placeholder="Jan 2022"
                value={item.startDate}
                onChange={(e) => update(item.id, { startDate: e.target.value })}
              />
            </Field>
            <Field label={t('resume.form.endDate')}>
              <Input
                placeholder="Dec 2024"
                disabled={item.current}
                value={item.current ? '' : item.endDate}
                onChange={(e) => update(item.id, { endDate: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`cur-exp-${item.id}`}
              checked={item.current}
              onCheckedChange={(v) => update(item.id, { current: !!v, endDate: '' })}
            />
            <label htmlFor={`cur-exp-${item.id}`} className="text-xs cursor-pointer">
              {t('resume.form.currentJob')}
            </label>
          </div>
          <Field label={t('resume.form.bullets')}>
            <Textarea
              placeholder={"• Developed REST APIs serving 1M+ daily users\n• Reduced load time by 40%"}
              rows={4}
              value={item.bullets.join('\n')}
              onChange={(e) => setBullets(item.id, e.target.value)}
            />
          </Field>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full" onClick={add}>
        <Plus className="h-3.5 w-3.5 mr-1" />
        {t('resume.form.add')} {t('resume.sections.experience')}
      </Button>
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
