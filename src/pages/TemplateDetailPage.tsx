import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { AuthModal } from '@/components/shared/AuthModal';
import { getTemplateById, createResume } from '@/services/resumeService';
import { loadSession } from '@/services/authService';
import type { ResumeTemplateDto } from '@/types/resume';
import ResumeRenderer from '@/components/resume/ResumeRenderer';
import { parseSections } from '@/types/resume';

// Demo data for preview
const DEMO_SECTIONS = [
  { id: 0, sectionType: 'overview' as const, sortOrder: 0, content: JSON.stringify({ fullName: 'John Doe', title: 'Software Engineer', email: 'john@example.com', phone: '+1 234 567 890', location: 'New York, USA', website: 'johndoe.dev', summary: 'Passionate software engineer with 5+ years of experience building scalable web applications.' }) },
  { id: 1, sectionType: 'experience' as const, sortOrder: 1, content: JSON.stringify([{ id: '1', company: 'TechCorp', position: 'Senior Developer', startDate: 'Jan 2022', endDate: '', current: true, bullets: ['Led a team of 5 engineers', 'Improved app performance by 40%', 'Shipped 3 major features'] }]) },
  { id: 2, sectionType: 'education' as const, sortOrder: 2, content: JSON.stringify([{ id: '1', school: 'MIT', degree: "Bachelor's", field: 'Computer Science', startDate: '2016', endDate: '2020', current: false, description: '' }]) },
  { id: 3, sectionType: 'skills' as const, sortOrder: 3, content: JSON.stringify([{ id: '1', name: 'Frontend', skills: ['React', 'TypeScript', 'TailwindCSS'] }, { id: '2', name: 'Backend', skills: ['.NET', 'PostgreSQL', 'Docker'] }]) },
  { id: 4, sectionType: 'projects' as const, sortOrder: 4, content: JSON.stringify([{ id: '1', name: 'CareerBoost', description: 'AI-powered resume builder', url: 'github.com/career', technologies: ['React', '.NET', 'AI'], bullets: ['Built in 3 months', 'Used by 1000+ users'] }]) },
  { id: 5, sectionType: 'languages' as const, sortOrder: 5, content: JSON.stringify([{ id: '1', language: 'English', proficiency: 'native' }, { id: '2', language: 'Uzbek', proficiency: 'native' }]) },
];

export default function TemplateDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const session = loadSession();

  const [template, setTemplate] = useState<ResumeTemplateDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    getTemplateById(Number(id))
      .then(setTemplate)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleCreate = async () => {
    if (!session) { setAuthOpen(true); return; }
    if (!template) return;
    setCreating(true);
    try {
      const resume = await createResume(session.accessToken, {
        title: `My Resume — ${template.name}`,
        templateId: template.id,
      });
      navigate(`/resumes/${resume.id}/edit`);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Template not found</p>
        <Button variant="outline" onClick={() => navigate('/templates')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> {t('resume.templates')}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/templates')}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('resume.templates')}
          </button>
          <div className="flex items-center gap-2">
            <Button onClick={handleCreate} disabled={creating} className="gap-1.5">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
              {t('resume.useTemplate')}
            </Button>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">{template.name}</h1>
              {template.category && (
                <p className="text-muted-foreground text-sm mt-1">{template.category}</p>
              )}
              <div className="flex gap-2 mt-3">
                <Badge variant={template.tier === 'premium' ? 'default' : 'secondary'}>
                  {template.tier === 'premium' ? t('resume.premium') : t('resume.free')}
                </Badge>
                {template.downloadCount > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <Download className="h-3 w-3" />
                    {template.downloadCount} {t('resume.downloads')}
                  </Badge>
                )}
              </div>
            </div>

            <Button onClick={handleCreate} disabled={creating} size="lg" className="w-full gap-2">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
              {t('resume.useTemplate')}
            </Button>

            {!session && (
              <p className="text-xs text-muted-foreground text-center">
                {t('resume.loginToCreate')}
              </p>
            )}
          </div>

          {/* Right: Preview */}
          <div className="lg:col-span-2">
            <div className="border rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-auto max-h-[80vh] bg-gray-50 flex justify-center p-4">
                <div style={{ transform: 'scale(0.7)', transformOrigin: 'top center', width: '210mm' }}>
                  <ResumeRenderer sections={DEMO_SECTIONS} templateId={template.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        reason="use_template"
      />
    </div>
  );
}
