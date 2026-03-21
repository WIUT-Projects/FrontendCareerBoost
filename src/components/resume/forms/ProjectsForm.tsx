import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, X } from 'lucide-react';
import type { ProjectItem } from '@/types/resume';
import { nanoid } from 'nanoid';

interface Props {
  value: ProjectItem[];
  onChange: (value: ProjectItem[]) => void;
}

const EMPTY = (): ProjectItem => ({
  id: nanoid(),
  name: '',
  description: '',
  url: '',
  technologies: [],
  bullets: [''],
});

export default function ProjectsForm({ value, onChange }: Props) {
  const { t } = useTranslation();

  const add = () => onChange([...value, EMPTY()]);
  const remove = (id: string) => onChange(value.filter((p) => p.id !== id));
  const update = (id: string, patch: Partial<ProjectItem>) =>
    onChange(value.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  return (
    <div className="space-y-4">
      {value.map((item, idx) => (
        <div key={item.id} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">#{idx + 1}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(item.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Field label={t('resume.form.projectName')}>
            <Input placeholder="CareerBoost" value={item.name} onChange={(e) => update(item.id, { name: e.target.value })} />
          </Field>
          <Field label={t('resume.form.projectUrl')}>
            <Input placeholder="https://github.com/..." value={item.url} onChange={(e) => update(item.id, { url: e.target.value })} />
          </Field>
          <Field label={t('resume.form.technologies')}>
            <TechInput
              value={item.technologies}
              onChange={(techs) => update(item.id, { technologies: techs })}
              placeholder={t('resume.form.techPlaceholder')}
            />
          </Field>
          <Field label={t('resume.form.description')}>
            <Textarea
              placeholder="A platform for..."
              rows={2}
              value={item.description}
              onChange={(e) => update(item.id, { description: e.target.value })}
            />
          </Field>
          <Field label={t('resume.form.bullets')}>
            <Textarea
              placeholder={"• Built RESTful API\n• Achieved 99.9% uptime"}
              rows={3}
              value={item.bullets.join('\n')}
              onChange={(e) => update(item.id, { bullets: e.target.value.split('\n') })}
            />
          </Field>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full" onClick={add}>
        <Plus className="h-3.5 w-3.5 mr-1" />
        {t('resume.form.add')} {t('resume.sections.projects')}
      </Button>
    </div>
  );
}

function TechInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setInput('');
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <Button variant="outline" size="icon" onClick={add} type="button"><Plus className="h-3.5 w-3.5" /></Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((t) => (
            <span key={t} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
              {t}
              <button type="button" onClick={() => onChange(value.filter((x) => x !== t))}><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      )}
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
