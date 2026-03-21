import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, X } from 'lucide-react';
import type { SkillCategory } from '@/types/resume';
import { nanoid } from 'nanoid';

interface Props {
  value: SkillCategory[];
  onChange: (value: SkillCategory[]) => void;
}

const EMPTY = (): SkillCategory => ({ id: nanoid(), name: '', skills: [] });

export default function SkillsForm({ value, onChange }: Props) {
  const { t } = useTranslation();

  const addCategory = () => onChange([...value, EMPTY()]);
  const removeCategory = (id: string) => onChange(value.filter((c) => c.id !== id));
  const updateCategory = (id: string, patch: Partial<SkillCategory>) =>
    onChange(value.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const addSkill = (catId: string, skill: string) => {
    const cat = value.find((c) => c.id === catId);
    if (!cat || !skill.trim() || cat.skills.includes(skill.trim())) return;
    updateCategory(catId, { skills: [...cat.skills, skill.trim()] });
  };
  const removeSkill = (catId: string, skill: string) => {
    const cat = value.find((c) => c.id === catId);
    if (!cat) return;
    updateCategory(catId, { skills: cat.skills.filter((s) => s !== skill) });
  };

  return (
    <div className="space-y-4">
      {value.map((cat, idx) => (
        <div key={cat.id} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">#{idx + 1}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeCategory(cat.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t('resume.form.category')}</Label>
            <Input
              placeholder="Frontend, Backend, Tools..."
              value={cat.name}
              onChange={(e) => updateCategory(cat.id, { name: e.target.value })}
            />
          </div>
          <SkillInput
            skills={cat.skills}
            placeholder={t('resume.form.skillsPlaceholder')}
            onAdd={(s) => addSkill(cat.id, s)}
            onRemove={(s) => removeSkill(cat.id, s)}
          />
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full" onClick={addCategory}>
        <Plus className="h-3.5 w-3.5 mr-1" />
        {t('resume.form.add')} {t('resume.sections.skills')}
      </Button>
    </div>
  );
}

function SkillInput({ skills, placeholder, onAdd, onRemove }: {
  skills: string[];
  placeholder: string;
  onAdd: (s: string) => void;
  onRemove: (s: string) => void;
}) {
  const [input, setInput] = useState('');
  const commit = () => { if (input.trim()) { onAdd(input.trim()); setInput(''); } };
  return (
    <div className="space-y-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }}
      />
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.map((s) => (
            <span key={s} className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full text-xs">
              {s}
              <button type="button" onClick={() => onRemove(s)}><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
