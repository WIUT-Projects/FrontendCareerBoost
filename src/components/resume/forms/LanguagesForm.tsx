import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import type { LanguageItem } from '@/types/resume';
import { nanoid } from 'nanoid';

interface Props {
  value: LanguageItem[];
  onChange: (value: LanguageItem[]) => void;
}

const LEVELS = ['native', 'fluent', 'intermediate', 'basic'] as const;

const EMPTY = (): LanguageItem => ({
  id: nanoid(),
  language: '',
  proficiency: 'fluent',
});

export default function LanguagesForm({ value, onChange }: Props) {
  const { t } = useTranslation();

  const add = () => onChange([...value, EMPTY()]);
  const remove = (id: string) => onChange(value.filter((l) => l.id !== id));
  const update = (id: string, patch: Partial<LanguageItem>) =>
    onChange(value.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  return (
    <div className="space-y-3">
      {value.map((item) => (
        <div key={item.id} className="flex items-end gap-2 border rounded-lg p-3">
          <div className="flex-1 space-y-1">
            <Label className="text-xs text-muted-foreground">{t('resume.form.language')}</Label>
            <Input
              placeholder="English"
              value={item.language}
              onChange={(e) => update(item.id, { language: e.target.value })}
            />
          </div>
          <div className="w-40 space-y-1">
            <Label className="text-xs text-muted-foreground">{t('resume.form.proficiency')}</Label>
            <Select
              value={item.proficiency}
              onValueChange={(v) => update(item.id, { proficiency: v as LanguageItem['proficiency'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {t(`resume.form.${l}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-destructive flex-shrink-0"
            onClick={() => remove(item.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full" onClick={add}>
        <Plus className="h-3.5 w-3.5 mr-1" />
        {t('resume.form.add')} {t('resume.sections.languages')}
      </Button>
    </div>
  );
}
