import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Palette, Eye, EyeOff, Loader2, Download, ExternalLink, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { getAllTemplatesAdmin, updateTemplate } from '@/services/adminService';
import type { AdminTemplateDto } from '@/services/adminService';
import ResumeRenderer from '@/components/resume/ResumeRenderer';
import { DEMO_SECTIONS } from '@/pages/TemplatesPage';

export default function AdminTemplatesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [templates, setTemplates]   = useState<AdminTemplateDto[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState<number | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<AdminTemplateDto | null>(null);
  const [editName, setEditName] = useState('');
  const [editIsDeleted, setEditIsDeleted] = useState(false);

  useEffect(() => {
    getAllTemplatesAdmin()
      .then((d) => setTemplates(d.items ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openEditModal = (tmpl: AdminTemplateDto) => {
    setEditingTemplate(tmpl);
    setEditName(tmpl.name);
    setEditIsDeleted(!tmpl.isActive);
  };

  const closeEditModal = () => {
    setEditingTemplate(null);
    setEditName('');
    setEditIsDeleted(false);
  };

  const saveEdit = async () => {
    if (!editingTemplate || !editName.trim()) return;
    setSaving(editingTemplate.id);
    try {
      const updated = await updateTemplate(editingTemplate.id, {
        name: editName,
        tier: editingTemplate.tier,
        isActive: !editIsDeleted,
        category: editingTemplate.category,
        priceUzs: editingTemplate.priceUzs,
        thumbnailUrl: editingTemplate.thumbnailUrl,
        previewUrl: null,
      });
      setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      closeEditModal();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(null);
    }
  };

  const patch = async (tmpl: AdminTemplateDto, changes: Partial<AdminTemplateDto>) => {
    setSaving(tmpl.id);
    const merged = { ...tmpl, ...changes };
    try {
      const updated = await updateTemplate(tmpl.id, {
        name: merged.name,
        tier: merged.tier,
        isActive: merged.isActive,
        category: merged.category,
        priceUzs: merged.priceUzs,
        thumbnailUrl: merged.thumbnailUrl,
        previewUrl: null,
      });
      setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background px-6 py-4 flex items-center gap-2">
        <Palette className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">{t('admin.templates.title')}</h1>
        <span className="ml-1 text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{templates.length}</span>
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 border-b bg-muted/30 px-6 py-2 flex items-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><Eye className="h-3 w-3 text-green-600" /> {t('admin.templates.visibleToUsers')}</span>
        <span className="flex items-center gap-1.5"><EyeOff className="h-3 w-3 text-muted-foreground" /> {t('admin.templates.hiddenFromUsers')}</span>
        <span dangerouslySetInnerHTML={{ __html: t('admin.templates.tierHint') }} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-6">
            {templates.map((tmpl) => (
              <TemplateAdminCard
                key={tmpl.id}
                template={tmpl}
                saving={saving === tmpl.id}
                onToggleActive={() => patch(tmpl, { isActive: !tmpl.isActive })}
                onEdit={() => openEditModal(tmpl)}
                onPreview={() => navigate(`/templates/${tmpl.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && closeEditModal()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('admin.templates.editTemplate')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">{t('admin.templates.templateName')}</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1.5"
                maxLength={200}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t('admin.templates.visibility')}</label>
              <Switch
                checked={!editIsDeleted}
                onCheckedChange={(checked) => setEditIsDeleted(!checked)}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {editIsDeleted ? t('admin.templates.hiddenFromUsers') : t('admin.templates.visibleToUsers')}
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeEditModal}>{t('admin.templates.cancel')}</Button>
            <Button onClick={saveEdit} disabled={saving !== null || !editName.trim()}>
              {saving === editingTemplate?.id ? t('admin.templates.saving') : t('admin.templates.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Template Admin Card ──────────────────────────────────────────────────────

interface CardProps {
  template: AdminTemplateDto;
  saving: boolean;
  onToggleActive: () => void;
  onEdit: () => void;
  onPreview: () => void;
}

function TemplateAdminCard({ template, saving, onToggleActive, onEdit, onPreview }: CardProps) {
  const { t } = useTranslation();
  const isActive = template.isActive;

  return (
    <div className={`border rounded-xl overflow-hidden flex flex-col bg-card transition-all ${isActive ? '' : 'opacity-60'}`}>
      {/* Preview */}
      <div
        className="relative overflow-hidden cursor-pointer group"
        style={{ aspectRatio: '210 / 260' }}
        onClick={onPreview}
      >
        {template.thumbnailUrl ? (
          <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover object-top" />
        ) : (
          <TemplatePreview templateName={template.name} />
        )}

        {/* Hidden overlay */}
        {!isActive && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium bg-background border rounded-full px-3 py-1">
              <EyeOff className="h-3 w-3" /> {t('admin.templates.hidden')}
            </div>
          </div>
        )}

        {/* Hover preview btn */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
          <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity gap-1.5 text-xs h-7">
            <ExternalLink className="h-3 w-3" />
            {t('admin.templates.preview')}
          </Button>
        </div>
      </div>

      {/* Info & controls */}
      <div className="p-3 space-y-2.5">
        {/* Name + downloads */}
        <div className="flex items-start justify-between gap-1">
          <div>
            <p className="font-semibold text-sm leading-tight">{template.name}</p>
            {template.category && (
              <p className="text-[11px] text-muted-foreground">{template.category}</p>
            )}
          </div>
          <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground flex-shrink-0">
            <Download className="h-3 w-3" />{template.downloadCount}
          </span>
        </div>

        {/* Edit button */}
        <Button
          size="sm"
          variant="outline"
          className="w-full h-7 text-xs gap-1.5"
          onClick={onEdit}
          disabled={saving}
        >
          <Pencil className="h-3.5 w-3.5" />
          {t('admin.templates.edit')}
        </Button>

        {/* Visibility toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {isActive
              ? <Eye className="h-3.5 w-3.5 text-green-600" />
              : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
            }
            <span className="text-xs text-muted-foreground">
              {isActive ? t('admin.templates.visible') : t('admin.templates.hidden')}
            </span>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={onToggleActive}
            disabled={saving}
            className="data-[state=checked]:bg-green-600"
          />
        </div>

        {saving && (
          <div className="flex justify-center">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Zoomed preview (same as TemplatesPage) ───────────────────────────────────

import { useEffect as useE, useRef, useState as useS } from 'react';

function TemplatePreview({ templateName }: { templateName: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useS(0.33);

  useE(() => {
    if (!wrapRef.current) return;
    const obs = new ResizeObserver(([entry]) => {
      setZoom(entry.contentRect.width / 794);
    });
    obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="w-full h-full overflow-hidden">
      <div style={{ width: '794px', transformOrigin: 'top left', transform: `scale(${zoom})`, height: `${100 / zoom}%`, pointerEvents: 'none' }}>
        <ResumeRenderer sections={DEMO_SECTIONS} templateName={templateName} />
      </div>
    </div>
  );
}
