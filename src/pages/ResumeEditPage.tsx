import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Download, Loader2, ArrowLeft, Save, Brain,
  User, GraduationCap, Briefcase, FolderOpen, Code2, Languages,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import ResumeRenderer from '@/components/resume/ResumeRenderer';
import OverviewForm from '@/components/resume/forms/OverviewForm';
import EducationForm from '@/components/resume/forms/EducationForm';
import ExperienceForm from '@/components/resume/forms/ExperienceForm';
import ProjectsForm from '@/components/resume/forms/ProjectsForm';
import SkillsForm from '@/components/resume/forms/SkillsForm';
import LanguagesForm from '@/components/resume/forms/LanguagesForm';
import { getResumeById, upsertSection } from '@/services/resumeService';
import { loadSession } from '@/services/authService';
import type {
  ResumeDto, ResumeSectionDto, SectionType,
  OverviewContent, EducationItem, ExperienceItem,
  ProjectItem, SkillCategory, LanguageItem,
} from '@/types/resume';
import { EMPTY_OVERVIEW, parseSections } from '@/types/resume';

const SECTION_ICONS: Record<SectionType, React.ElementType> = {
  overview: User,
  education: GraduationCap,
  experience: Briefcase,
  projects: FolderOpen,
  skills: Code2,
  languages: Languages,
};

const SECTION_ORDER: SectionType[] = ['overview', 'education', 'experience', 'projects', 'skills', 'languages'];

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function ResumeEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const session = loadSession();

  const [resume, setResume] = useState<ResumeDto | null>(null);
  const [sections, setSections] = useState<ResumeSectionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionType>('overview');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Title editing
  const [title, setTitle] = useState('');

  // Section content states (parsed from JSON)
  const [overview, setOverview] = useState<OverviewContent>(EMPTY_OVERVIEW);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [languages, setLanguages] = useState<LanguageItem[]>([]);

  // Load resume
  useEffect(() => {
    if (!session || !id) { navigate('/login'); return; }
    getResumeById(Number(id), session.accessToken)
      .then((data) => {
        setResume(data);
        setTitle(data.title ?? '');
        setSections(data.sections ?? []);
        const parsed = parseSections(data.sections ?? []);
        setOverview(parsed.overview);
        setEducation(parsed.education);
        setExperience(parsed.experience);
        setProjects(parsed.projects);
        setSkills(parsed.skills);
        setLanguages(parsed.languages);
        isLoaded.current = true;
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Get current section content as JSON
  const getSectionJson = useCallback((type: SectionType): string => {
    switch (type) {
      case 'overview': return JSON.stringify(overview);
      case 'education': return JSON.stringify(education);
      case 'experience': return JSON.stringify(experience);
      case 'projects': return JSON.stringify(projects);
      case 'skills': return JSON.stringify(skills);
      case 'languages': return JSON.stringify(languages);
    }
  }, [overview, education, experience, projects, skills, languages]);

  // Guard: prevents auto-save from firing on initial data hydration
  const isLoaded = useRef(false);

  // Debounced save
  const debouncedOverview = useDebounce(overview, 800);
  const debouncedEducation = useDebounce(education, 800);
  const debouncedExperience = useDebounce(experience, 800);
  const debouncedProjects = useDebounce(projects, 800);
  const debouncedSkills = useDebounce(skills, 800);
  const debouncedLanguages = useDebounce(languages, 800);

  const doSave = useCallback(async (type: SectionType, content: string) => {
    if (!session || !id) return;
    setSaveStatus('saving');
    try {
      const updated = await upsertSection(Number(id), type, content, session.accessToken);
      setSections((prev) => {
        const idx = prev.findIndex((s) => s.sectionType === type);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updated;
          return next;
        }
        return [...prev, updated];
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      console.error(e);
      setSaveStatus('idle');
    }
  }, [session, id]);

  // Auto-save on debounce — only after initial data is loaded
  useEffect(() => { if (!isLoaded.current) return; doSave('overview', JSON.stringify(debouncedOverview)); }, [debouncedOverview]);
  useEffect(() => { if (!isLoaded.current) return; doSave('education', JSON.stringify(debouncedEducation)); }, [debouncedEducation]);
  useEffect(() => { if (!isLoaded.current) return; doSave('experience', JSON.stringify(debouncedExperience)); }, [debouncedExperience]);
  useEffect(() => { if (!isLoaded.current) return; doSave('projects', JSON.stringify(debouncedProjects)); }, [debouncedProjects]);
  useEffect(() => { if (!isLoaded.current) return; doSave('skills', JSON.stringify(debouncedSkills)); }, [debouncedSkills]);
  useEffect(() => { if (!isLoaded.current) return; doSave('languages', JSON.stringify(debouncedLanguages)); }, [debouncedLanguages]);

  // Download PDF — use a hidden full-size (no zoom) container to avoid html2canvas artifacts
  const pdfRef = useRef<HTMLDivElement>(null);
  const handleDownload = async () => {
    if (!pdfRef.current) return;
    const { default: html2canvas } = await import('html2canvas');
    const { jsPDF } = await import('jspdf');
    const canvas = await html2canvas(pdfRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: 794, // 210mm at 96dpi
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`${title || 'resume'}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Resume not found</p>
        <Button variant="outline" onClick={() => navigate('/resumes')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> {t('resume.myResumes')}
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Top Header */}
      <header className="flex-shrink-0 border-b bg-background z-30">
        <div className="px-3 lg:px-4 h-13 lg:h-14 flex items-center gap-2 lg:gap-3">
          <button
            onClick={() => navigate('/resumes')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Editable title */}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 min-w-0 border-0 border-b border-transparent hover:border-border focus:border-primary rounded-none px-0 text-sm font-medium bg-transparent focus-visible:ring-0"
          />

          <div className="flex-1" />

          {/* Save status — hide text on mobile */}
          {saveStatus !== 'idle' && (
            <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
              {saveStatus === 'saving' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Save className="h-3 w-3" />
              )}
              <span className="hidden sm:inline">
                {saveStatus === 'saving' ? t('resume.saving') : t('resume.saved')}
              </span>
            </span>
          )}

          <Button variant="outline" size="sm" className="gap-1.5 flex-shrink-0" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">{t('resume.download')}</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 flex-shrink-0">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">{t('resume.aiReview')}</span>
          </Button>
          <LanguageSwitcher />
        </div>
      </header>

      {/* 3-panel body — desktop: sidebar+form | preview (50/50), mobile: vertical */}
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">

        {/* ── Mobile: horizontal section tabs ── */}
        <div className="lg:hidden flex-shrink-0 border-b overflow-x-auto">
          <div className="flex px-2 py-1 gap-1 min-w-max">
            {SECTION_ORDER.map((type) => {
              const Icon = SECTION_ICONS[type];
              const isActive = activeSection === type;
              return (
                <button
                  key={type}
                  onClick={() => setActiveSection(type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t(`resume.sections.${type}`)}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Left half: sidebar (desktop) + form ── */}
        <div className="flex lg:w-[46%] lg:border-r overflow-hidden flex-shrink-0 lg:flex-shrink">

          {/* Vertical sidebar — desktop only */}
          <aside className="hidden lg:flex flex-col w-44 flex-shrink-0 border-r bg-muted/30 overflow-y-auto">
            <nav className="py-2">
              {SECTION_ORDER.map((type) => {
                const Icon = SECTION_ICONS[type];
                const isActive = activeSection === type;
                return (
                  <button
                    key={type}
                    onClick={() => setActiveSection(type)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {t(`resume.sections.${type}`)}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Form panel */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 lg:p-5">
              <h2 className="text-base font-semibold mb-4">
                {t(`resume.sections.${activeSection}`)}
              </h2>
              <SectionForm
                type={activeSection}
                overview={overview} onOverviewChange={setOverview}
                education={education} onEducationChange={setEducation}
                experience={experience} onExperienceChange={setExperience}
                projects={projects} onProjectsChange={setProjects}
                skills={skills} onSkillsChange={setSkills}
                languages={languages} onLanguagesChange={setLanguages}
              />
            </div>
          </div>
        </div>

        {/* ── Right half: Live preview ── */}
        <div className="lg:w-[54%] overflow-auto bg-gray-100 flex justify-center py-4 min-h-[300px] lg:min-h-0">
          <div
            style={{
              zoom: 0.72,
              width: '210mm',
              flexShrink: 0,
            }}
          >
            <ResumeRenderer sections={sections} templateId={resume.templateId} />
          </div>
        </div>
      </div>

      {/* Hidden full-size resume for PDF capture — no zoom/scale so html2canvas renders cleanly */}
      <div
        aria-hidden="true"
        style={{ position: 'fixed', top: '-9999px', left: '-9999px', width: '210mm', pointerEvents: 'none' }}
      >
        <div ref={pdfRef}>
          <ResumeRenderer sections={sections} templateId={resume.templateId} />
        </div>
      </div>
    </div>
  );
}

// Section form switcher
function SectionForm({
  type,
  overview, onOverviewChange,
  education, onEducationChange,
  experience, onExperienceChange,
  projects, onProjectsChange,
  skills, onSkillsChange,
  languages, onLanguagesChange,
}: {
  type: SectionType;
  overview: OverviewContent; onOverviewChange: (v: OverviewContent) => void;
  education: EducationItem[]; onEducationChange: (v: EducationItem[]) => void;
  experience: ExperienceItem[]; onExperienceChange: (v: ExperienceItem[]) => void;
  projects: ProjectItem[]; onProjectsChange: (v: ProjectItem[]) => void;
  skills: SkillCategory[]; onSkillsChange: (v: SkillCategory[]) => void;
  languages: LanguageItem[]; onLanguagesChange: (v: LanguageItem[]) => void;
}) {
  switch (type) {
    case 'overview': return <OverviewForm value={overview} onChange={onOverviewChange} />;
    case 'education': return <EducationForm value={education} onChange={onEducationChange} />;
    case 'experience': return <ExperienceForm value={experience} onChange={onExperienceChange} />;
    case 'projects': return <ProjectsForm value={projects} onChange={onProjectsChange} />;
    case 'skills': return <SkillsForm value={skills} onChange={onSkillsChange} />;
    case 'languages': return <LanguagesForm value={languages} onChange={onLanguagesChange} />;
  }
}
