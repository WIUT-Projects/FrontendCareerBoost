import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import type { EducationItem } from '@/types/resume';
import { nanoid } from 'nanoid';

interface Props {
  value: EducationItem[];
  onChange: (value: EducationItem[]) => void;
}

const EMPTY = (): EducationItem => ({
  id: nanoid(),
  school: '',
  degree: '',
  field: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
});

export default function EducationForm({ value, onChange }: Props) {
  const { t } = useTranslation();

  const add = () => onChange([...value, EMPTY()]);
  const remove = (id: string) => onChange(value.filter((e) => e.id !== id));
  const update = (id: string, patch: Partial<EducationItem>) =>
    onChange(value.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  return (
    <div className="space-y-4">
      {value.map((item, idx) => (
        <div key={item.id} className="border rounded-lg p-4 space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              #{idx + 1}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={() => remove(item.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Field label={t('resume.form.school')}>
            <Input
              placeholder="MIT"
              value={item.school}
              onChange={(e) => update(item.id, { school: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('resume.form.degree')}>
              <Input
                placeholder="Bachelor's"
                value={item.degree}
                onChange={(e) => update(item.id, { degree: e.target.value })}
              />
            </Field>
            <Field label={t('resume.form.field')}>
              <Input
                placeholder="Computer Science"
                value={item.field}
                onChange={(e) => update(item.id, { field: e.target.value })}
              />
            </Field>
            <Field label={t('resume.form.startDate')}>
              <Input
                placeholder="Sep 2018"
                value={item.startDate}
                onChange={(e) => update(item.id, { startDate: e.target.value })}
              />
            </Field>
            <Field label={t('resume.form.endDate')}>
              <Input
                placeholder="Jun 2022"
                disabled={item.current}
                value={item.current ? '' : item.endDate}
                onChange={(e) => update(item.id, { endDate: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`cur-${item.id}`}
              checked={item.current}
              onCheckedChange={(v) => update(item.id, { current: !!v, endDate: '' })}
            />
            <label htmlFor={`cur-${item.id}`} className="text-xs cursor-pointer">
              {t('resume.form.current')}
            </label>
          </div>
          <Field label={t('resume.form.description')}>
            <Textarea
              placeholder="GPA 3.8 / 4.0, Dean's List..."
              rows={2}
              value={item.description}
              onChange={(e) => update(item.id, { description: e.target.value })}
            />
          </Field>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full" onClick={add}>
        <Plus className="h-3.5 w-3.5 mr-1" />
        {t('resume.form.add')} {t('resume.sections.education')}
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
