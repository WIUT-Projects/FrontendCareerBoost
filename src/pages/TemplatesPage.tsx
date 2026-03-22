import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download, Loader2, Palette, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getTemplates } from '@/services/resumeService';
import { loadSession } from '@/services/authService';
import type { ResumeTemplateDto, ResumeSectionDto } from '@/types/resume';
import ResumeRenderer from '@/components/resume/ResumeRenderer';

// ── Demo data for previewing each template (exported for admin page) ────────
export const DEMO_SECTIONS: ResumeSectionDto[] = [
  {
    id: 1, sectionType: 'overview', sortOrder: 0,
    content: JSON.stringify({
      fullName: 'Alex Johnson',
      title: 'Senior Software Engineer',
      email: 'alex@example.com',
      phone: '+1 555 234 567',
      location: 'San Francisco, CA',
      website: 'alexj.dev',
      summary:
        'Full-stack engineer with 6+ years building scalable products. Passionate about clean architecture and developer experience.',
    }),
  },
  {
    id: 2, sectionType: 'experience', sortOrder: 1,
    content: JSON.stringify([
      {
        id: 'e1', company: 'Stripe', position: 'Senior Engineer',
        startDate: 'Jan 2022', endDate: '', current: true,
        bullets: ['Led payments SDK redesign', 'Reduced latency 40%', 'Mentored 4 engineers'],
      },
      {
        id: 'e2', company: 'Twilio', position: 'Software Engineer',
        startDate: 'Mar 2019', endDate: 'Dec 2021', current: false,
        bullets: ['Built messaging pipeline handling 10M msgs/day', 'Improved CI/CD speed by 60%'],
      },
    ]),
  },
  {
    id: 3, sectionType: 'education', sortOrder: 2,
    content: JSON.stringify([
      {
        id: 'ed1', school: 'MIT', degree: "Bachelor's", field: 'Computer Science',
        startDate: 'Sep 2015', endDate: 'Jun 2019', current: false, description: '',
      },
    ]),
  },
  {
    id: 4, sectionType: 'projects', sortOrder: 3,
    content: JSON.stringify([
      {
        id: 'p1', name: 'OpenResume', url: 'github.com/open-resume',
        technologies: ['React', 'TypeScript', 'Node.js'],
        description: 'Open-source resume builder used by 50k+ devs',
        bullets: ['Built in 3 months', 'Featured on Product Hunt'],
      },
    ]),
  },
  {
    id: 5, sectionType: 'skills', sortOrder: 4,
    content: JSON.stringify([
      { id: 's1', category: 'Frontend', skills: ['React', 'TypeScript', 'TailwindCSS'] },
      { id: 's2', category: 'Backend', skills: ['.NET', 'PostgreSQL', 'Docker'] },
    ]),
  },
  {
    id: 6, sectionType: 'languages', sortOrder: 5,
    content: JSON.stringify([
      { id: 'l1', language: 'English', proficiency: 'native' },
      { id: 'l2', language: 'Spanish', proficiency: 'intermediate' },
    ]),
  },
];

// ── Zoomed card preview — renders actual ResumeRenderer at A4 scale ─────────
function TemplatePreview({ templateId }: { templateId: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.35);

  useEffect(() => {
    if (!wrapRef.current) return;
    const obs = new ResizeObserver(([entry]) => {
      // A4 width in px at 96dpi ≈ 794px
      setZoom(entry.contentRect.width / 794);
    });
    obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="w-full h-full overflow-hidden">
      <div
        style={{
          width: '794px',
          transformOrigin: 'top left',
          transform: `scale(${zoom})`,
          // Keep the height from overflowing the card
          height: `${100 / zoom}%`,
          pointerEvents: 'none',
        }}
      >
        <ResumeRenderer sections={DEMO_SECTIONS} templateId={templateId} />
      </div>
    </div>
  );
}

// ── Template card ────────────────────────────────────────────────────────────
function TemplateCard({
  template,
  onClick,
}: {
  template: ResumeTemplateDto;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const isPremium = template.tier === 'premium';

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer flex flex-col"
    >
      {/* Preview — A4 aspect ratio (210/297) */}
      <div
        className="relative w-full overflow-hidden rounded-xl shadow-md ring-1 ring-border
                   group-hover:shadow-xl group-hover:ring-primary/40 transition-all duration-300"
        style={{ aspectRatio: '210 / 297' }}
      >
        {template.thumbnailUrl ? (
          <img
            src={template.thumbnailUrl}
            alt={template.name}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <TemplatePreview templateId={template.id} />
        )}

        {/* Premium badge — top-left */}
        {isPremium && (
          <div className="absolute top-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold
                             bg-amber-400/90 text-amber-900 backdrop-blur-sm shadow">
              <Sparkles className="h-2.5 w-2.5" />
              {t('resume.premium')}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300
                     flex items-center justify-center"
        >
          <Button
            size="sm"
            className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
                       transition-all duration-300 shadow-lg"
          >
            {t('resume.useTemplate')}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-2.5 px-0.5 flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm text-foreground">{template.name}</p>
          {template.downloadCount > 0 && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Download className="h-3 w-3" />
              {template.downloadCount.toLocaleString()} {t('resume.downloads')}
            </p>
          )}
        </div>
        {!isPremium && (
          <Badge variant="secondary" className="text-xs font-medium">
            {t('resume.free')}
          </Badge>
        )}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
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

  const filtered =
    activeFilter === 'all'
      ? templates
      : templates.filter((t) => t.tier === activeFilter);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* ── Hero header ── */}
      <div className="flex-shrink-0 border-b bg-background">
        <div className="max-w-6xl mx-auto px-6 pt-8 pb-5">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('resume.templatePageTitle')}
              </h1>
              <p className="mt-1 text-muted-foreground text-sm max-w-xl">
                {t('resume.templatePageSubtitle')}
              </p>
            </div>
            {session && (
              <Button variant="outline" size="sm" onClick={() => navigate('/resumes')}>
                {t('resume.myResumes')}
              </Button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 mt-5">
            {(['all', 'free', 'premium'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                  activeFilter === f
                    ? 'bg-foreground text-background shadow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {f === 'all'
                  ? t('resume.allTemplates')
                  : f === 'free'
                    ? t('resume.free')
                    : t('resume.premium')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scrollable grid ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-32 text-muted-foreground">
              <Palette className="h-12 w-12 mx-auto mb-4 opacity-25" />
              <p className="text-sm">{t('resume.noResumes')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {filtered.map((tmpl) => (
                <TemplateCard
                  key={tmpl.id}
                  template={tmpl}
                  onClick={() => navigate(`/templates/${tmpl.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
