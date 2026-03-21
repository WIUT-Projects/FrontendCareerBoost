import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Palette, Download, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { getTemplates } from '@/services/resumeService';
import { loadSession } from '@/services/authService';
import type { ResumeTemplateDto } from '@/types/resume';

// Template preview colors (when no thumbnailUrl)
const PREVIEW_STYLES: Record<number, { bg: string; accent: string }> = {
  1: { bg: '#f8fafc', accent: '#1a1a1a' },
  2: { bg: '#eff6ff', accent: '#2563eb' },
  3: { bg: '#f0fdf4', accent: '#16a34a' },
  4: { bg: '#fdf4ff', accent: '#9333ea' },
  5: { bg: '#fff7ed', accent: '#ea580c' },
};
const getStyle = (id: number) => PREVIEW_STYLES[id] ?? { bg: '#f8fafc', accent: '#374151' };

export default function TemplatesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = loadSession();

  const [templates, setTemplates] = useState<ResumeTemplateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'free' | 'premium'>('all');

  useEffect(() => {
    getTemplates({ pageSize: 50, isActive: true })
      .then((res) => setTemplates(res.items ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeFilter === 'all'
    ? templates
    : templates.filter((t) => t.tier === activeFilter);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">{t('resume.templates')}</h1>
          </div>
          <div className="flex items-center gap-2">
            {session && (
              <Button variant="outline" size="sm" onClick={() => navigate('/resumes')}>
                {t('resume.myResumes')}
              </Button>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-8">
          {(['all', 'free', 'premium'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFilter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {f === 'all' ? t('resume.allTemplates') : f === 'free' ? t('resume.free') : t('resume.premium')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Palette className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>{t('resume.noResumes')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((tmpl) => (
              <TemplateCard
                key={tmpl.id}
                template={tmpl}
                onClick={() => navigate(`/templates/${tmpl.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function TemplateCard({ template, onClick }: { template: ResumeTemplateDto; onClick: () => void }) {
  const { t } = useTranslation();
  const style = getStyle(template.id);

  return (
    <div
      className="group border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 bg-card"
      onClick={onClick}
    >
      {/* Preview area */}
      <div
        className="relative h-52 flex items-center justify-center overflow-hidden"
        style={{ background: style.bg }}
      >
        {template.thumbnailUrl ? (
          <img
            src={template.thumbnailUrl}
            alt={template.name}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <TemplateMiniPreview id={template.id} name={template.name} style={style} />
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button size="sm" className="gap-1.5">
            <Star className="h-3.5 w-3.5" />
            {t('resume.preview')}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">{template.name}</p>
          {template.category && (
            <p className="text-xs text-muted-foreground">{template.category}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={template.tier === 'premium' ? 'default' : 'secondary'} className="text-xs">
            {template.tier === 'premium' ? t('resume.premium') : t('resume.free')}
          </Badge>
          {template.downloadCount > 0 && (
            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
              <Download className="h-3 w-3" />
              {template.downloadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CSS-based mini template previews ─────────────────────────────────────────

function TemplateMiniPreview({
  id,
  name,
  style,
}: {
  id: number;
  name: string;
  style: { bg: string; accent: string };
}) {
  // Modern template: colored header + 2 columns
  if (id === 2) {
    return (
      <div className="w-36 h-44 bg-white rounded shadow-md overflow-hidden text-left" style={{ fontSize: '5px', lineHeight: 1.4 }}>
        <div style={{ background: style.accent, padding: '6px 8px', color: '#fff' }}>
          <div style={{ fontWeight: 700, fontSize: '7px' }}>John Doe</div>
          <div style={{ opacity: 0.85, fontSize: '5px' }}>Software Engineer</div>
        </div>
        <div style={{ display: 'flex', height: 'calc(100% - 36px)' }}>
          <div style={{ width: '40%', background: '#f8fafc', padding: '4px', borderRight: '1px solid #e2e8f0' }}>
            <div style={{ color: style.accent, fontWeight: 700, fontSize: '4px', marginBottom: '2px' }}>SKILLS</div>
            <div style={{ background: '#e0e7ff', borderRadius: '3px', padding: '1px 3px', marginBottom: '1px', color: style.accent, fontSize: '4px' }}>React</div>
            <div style={{ background: '#e0e7ff', borderRadius: '3px', padding: '1px 3px', marginBottom: '1px', color: style.accent, fontSize: '4px' }}>.NET</div>
            <div style={{ background: '#e0e7ff', borderRadius: '3px', padding: '1px 3px', color: style.accent, fontSize: '4px' }}>Docker</div>
          </div>
          <div style={{ flex: 1, padding: '4px' }}>
            <div style={{ color: style.accent, fontWeight: 700, fontSize: '4px', marginBottom: '3px' }}>EXPERIENCE</div>
            <div style={{ fontWeight: 600, fontSize: '5px' }}>Sr. Developer</div>
            <div style={{ color: style.accent, fontSize: '4px' }}>TechCorp</div>
            <div style={{ opacity: 0.5, fontSize: '3.5px' }}>2022 – Present</div>
          </div>
        </div>
      </div>
    );
  }

  // Minimal template: ultra-clean, gray
  if (id === 3) {
    return (
      <div className="w-36 h-44 bg-white rounded shadow-md p-4 text-left" style={{ fontSize: '5px', lineHeight: 1.5 }}>
        <div style={{ fontWeight: 300, fontSize: '9px', color: '#111', letterSpacing: '-0.3px' }}>John Doe</div>
        <div style={{ color: '#999', fontSize: '5px', marginBottom: '6px' }}>Software Engineer</div>
        <div style={{ height: '1px', background: '#f0f0f0', marginBottom: '5px' }} />
        <div style={{ color: '#bbb', fontSize: '3.5px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '3px' }}>Experience</div>
        <div style={{ fontWeight: 600, fontSize: '5px' }}>Sr. Developer</div>
        <div style={{ color: '#888', fontSize: '4px' }}>TechCorp · 2022–Now</div>
        <div style={{ color: '#bbb', fontSize: '3.5px', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '5px', marginBottom: '3px' }}>Skills</div>
        <div style={{ color: '#666', fontSize: '4px' }}>React, .NET, Docker, PostgreSQL</div>
      </div>
    );
  }

  // Executive (id=4): dark sidebar
  if (id === 4) {
    return (
      <div className="w-36 h-44 bg-white rounded shadow-md overflow-hidden text-left" style={{ fontSize: '5px', lineHeight: 1.4, display: 'flex' }}>
        <div style={{ width: '35%', background: '#1e293b', padding: '6px 4px', color: '#fff' }}>
          <div style={{ fontWeight: 700, fontSize: '6px', marginBottom: '8px' }}>JD</div>
          <div style={{ color: '#94a3b8', fontSize: '3.5px', textTransform: 'uppercase', marginBottom: '2px' }}>Skills</div>
          <div style={{ fontSize: '4px', marginBottom: '1px' }}>React</div>
          <div style={{ fontSize: '4px', marginBottom: '1px' }}>.NET</div>
          <div style={{ fontSize: '4px', marginBottom: '1px' }}>SQL</div>
        </div>
        <div style={{ flex: 1, padding: '6px' }}>
          <div style={{ fontWeight: 700, fontSize: '7px', color: '#1e293b' }}>John Doe</div>
          <div style={{ color: '#64748b', fontSize: '5px', marginBottom: '5px' }}>Sr. Engineer</div>
          <div style={{ color: style.accent, fontWeight: 700, fontSize: '4px', marginBottom: '2px' }}>EXPERIENCE</div>
          <div style={{ fontWeight: 600, fontSize: '5px' }}>Tech Lead</div>
          <div style={{ color: '#888', fontSize: '4px' }}>Corp · 2022–Now</div>
        </div>
      </div>
    );
  }

  // Creative (id=5): bold colorful accent
  if (id === 5) {
    return (
      <div className="w-36 h-44 bg-white rounded shadow-md overflow-hidden text-left" style={{ fontSize: '5px', lineHeight: 1.4 }}>
        <div style={{ background: style.accent, height: '4px' }} />
        <div style={{ padding: '6px 8px' }}>
          <div style={{ fontWeight: 800, fontSize: '8px', color: '#111', letterSpacing: '-0.5px' }}>John Doe</div>
          <div style={{ color: style.accent, fontSize: '5px', fontWeight: 600, marginBottom: '6px' }}>Software Engineer</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginBottom: '5px' }}>
            {['React', '.NET', 'Docker'].map((s) => (
              <span key={s} style={{ background: style.bg, color: style.accent, padding: '1px 3px', borderRadius: '2px', fontSize: '4px', fontWeight: 600 }}>{s}</span>
            ))}
          </div>
          <div style={{ borderLeft: `2px solid ${style.accent}`, paddingLeft: '4px' }}>
            <div style={{ fontWeight: 700, fontSize: '5px' }}>Sr. Developer</div>
            <div style={{ color: '#888', fontSize: '4px' }}>TechCorp · 2022–Now</div>
          </div>
        </div>
      </div>
    );
  }

  // Default / Classic (id=1)
  return (
    <div className="w-36 h-44 bg-white rounded shadow-md p-3 text-left" style={{ fontSize: '5px', lineHeight: 1.4, fontFamily: 'Georgia, serif' }}>
      <div style={{ textAlign: 'center', borderBottom: '1.5px solid #1a1a1a', paddingBottom: '4px', marginBottom: '4px' }}>
        <div style={{ fontWeight: 700, fontSize: '7px', letterSpacing: '1px' }}>JOHN DOE</div>
        <div style={{ color: '#555', fontSize: '5px' }}>Software Engineer</div>
      </div>
      <div style={{ fontWeight: 700, fontSize: '4.5px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Experience</div>
      <div style={{ fontSize: '4.5px', fontWeight: 600 }}>Senior Developer</div>
      <div style={{ color: '#666', fontSize: '4px', fontStyle: 'italic' }}>TechCorp · 2022–Present</div>
      <div style={{ fontWeight: 700, fontSize: '4.5px', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px', marginBottom: '2px' }}>Education</div>
      <div style={{ fontSize: '4.5px', fontWeight: 600 }}>BS Computer Science</div>
      <div style={{ color: '#666', fontSize: '4px', fontStyle: 'italic' }}>MIT · 2020</div>
    </div>
  );
}
