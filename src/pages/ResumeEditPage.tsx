import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Download, Loader2, ArrowLeft, Save,
  User, GraduationCap, Briefcase, FolderOpen, Code2, Languages,
} from 'lucide-react';
import { AiReviewButton } from '@/components/resume/AiReviewButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ResumeRenderer from '@/components/resume/ResumeRenderer';
import OverviewForm from '@/components/resume/forms/OverviewForm';
import EducationForm from '@/components/resume/forms/EducationForm';
import ExperienceForm from '@/components/resume/forms/ExperienceForm';
import ProjectsForm from '@/components/resume/forms/ProjectsForm';
import SkillsForm from '@/components/resume/forms/SkillsForm';
import LanguagesForm from '@/components/resume/forms/LanguagesForm';
import { getResumeById, upsertSection } from '@/services/resumeService';
import { analyzeResumeById } from '@/services/aiAnalysisService';
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

  // ── AI Analysis ──────────────────────────────────────────────────────────
  const [analyzing, setAnalyzing] = useState(false);

  const handleAiReview = async () => {
    if (!session || !id) return;
    setAnalyzing(true);
    try {
      const result = await analyzeResumeById(Number(id), session.accessToken);
      navigate('/ai-analysis', { state: { result } });
    } catch (e: any) {
      console.error('AI analysis failed:', e);
      // Show error toast if needed
    } finally {
      setAnalyzing(false);
    }
  };

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

  // ─── PDF Download ────────────────────────────────────────────────────────────
  // Strategy:
  //  1. The pdfRef element renders the resume at full size (off-screen, visibility:hidden).
  //  2. We CLONE that content and temporarily append it to document.body, bypassing
  //     any overflow:hidden ancestor that would cap the element's measured height.
  //  3. html2canvas captures the FULL height from the body-attached clone.
  //  4. We slice the resulting canvas into A4-height strips and add each as a PDF page.
  const pdfRef = useRef<HTMLDivElement>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const handleDownload = async () => {
    if (!pdfRef.current || pdfGenerating) return;
    setPdfGenerating(true);

    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');

      // --- Step 1: clone rendered content into a body-level div (no overflow clipping) ---
      const clone = pdfRef.current.cloneNode(true) as HTMLElement;

      // Strip the page-break visual lines — they are UI-only, not real content
      clone.querySelectorAll('.resume-page-break-line').forEach(el => el.remove());

      // Temporary capture wrapper: fixed at (0,0) so html2canvas can see the full height,
      // behind all content via z-index so the user never sees it.
      const captureEl = document.createElement('div');
      captureEl.style.cssText =
        'position:fixed;top:0;left:0;width:794px;z-index:-99999;pointer-events:none;background:#fff;';
      captureEl.appendChild(clone);
      document.body.appendChild(captureEl);

      // Give the browser one animation frame to perform layout on the clone
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

      const fullHeight = captureEl.scrollHeight; // full content height, no clipping

      // --- Step 2: capture ---
      const canvas = await html2canvas(captureEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 794,        // 210 mm at 96 dpi — matches template width
        windowHeight: fullHeight, // virtual window tall enough for all content
        height: fullHeight,
        scrollX: 0,
        scrollY: 0,
      });

      // Clean up the temporary DOM node immediately after capture
      document.body.removeChild(captureEl);

      // --- Step 3: slice canvas into A4 pages ---
      const PAGE_W_MM = 210;
      const PAGE_H_MM = 297;
      // canvas.width == 794 * scale == 1588 px  →  represents 210 mm
      // one A4 page height in canvas pixels:
      const a4PageHPx = Math.round((PAGE_H_MM / PAGE_W_MM) * canvas.width);

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      let yOffset = 0;
      let pageIdx = 0;

      while (yOffset < canvas.height) {
        if (pageIdx > 0) pdf.addPage();

        const sliceH = Math.min(a4PageHPx, canvas.height - yOffset);

        const tmp = document.createElement('canvas');
        tmp.width  = canvas.width;
        tmp.height = sliceH;
        const ctx = tmp.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, 0, yOffset, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        }

        // sliceH canvas-px → mm (canvas.width = 210 mm)
        const sliceHeightMm = (sliceH / canvas.width) * PAGE_W_MM;
        pdf.addImage(tmp.toDataURL('image/png'), 'PNG', 0, 0, PAGE_W_MM, sliceHeightMm);

        yOffset  += a4PageHPx;
        pageIdx  += 1;
      }

      pdf.save(`${title || 'resume'}.pdf`);
    } finally {
      setPdfGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Resume not found</p>
        <Button variant="outline" onClick={() => navigate('/resumes')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> {t('resume.myResumes')}
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">

      {/* 3-panel body — desktop: sidebar+form | preview, mobile: vertical */}
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">

        {/* ── Left half: panel header + mobile tabs + sidebar + form ── */}
        <div className="flex flex-col lg:w-[46%] lg:border-r overflow-hidden flex-shrink-0 lg:flex-shrink">

          {/* Panel header — back + title + save + mobile action buttons */}
          <div className="flex-shrink-0 border-b bg-background px-3 py-2 flex items-center gap-2">
            <button
              onClick={() => navigate('/resumes')}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-7 flex-1 min-w-0 border-0 border-b border-transparent hover:border-border focus:border-primary rounded-none px-0 text-sm font-medium bg-transparent focus-visible:ring-0"
            />
            {saveStatus !== 'idle' && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                {saveStatus === 'saving'
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <Save className="h-3 w-3" />}
              </span>
            )}
            {/* Mobile-only: Download + AI Review */}
            <Button variant="ghost" size="icon" className="lg:hidden h-7 w-7 flex-shrink-0" onClick={handleDownload} disabled={pdfGenerating}>
              {pdfGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            </Button>
            <span className="lg:hidden flex-shrink-0">
              <AiReviewButton variant="icon" size="sm" onClick={handleAiReview} loading={analyzing} />
            </span>
          </div>

          {/* Mobile: horizontal section tabs */}
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

          {/* Desktop: sidebar + form (side by side) */}
          <div className="flex flex-1 overflow-hidden">
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
        </div>

        {/* ── Right half: preview header + live preview ── */}
        <div className="flex flex-col lg:w-[54%] overflow-hidden min-h-[300px] lg:min-h-0">
          {/* Desktop-only: Download + AI Review strip */}
          <div className="hidden lg:flex flex-shrink-0 border-b bg-gray-100 items-center justify-end gap-2.5 px-4 py-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownload} disabled={pdfGenerating}>
              {pdfGenerating
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Download className="h-4 w-4" />}
              {pdfGenerating ? 'Generating…' : t('resume.download')}
            </Button>
            <AiReviewButton size="sm" onClick={handleAiReview} loading={analyzing} />
          </div>

          {/* Scrollable preview */}
          <div className="flex-1 overflow-auto bg-gray-100 flex justify-center py-4">
            <div style={{ zoom: 0.72, width: '210mm', flexShrink: 0 }}>
              <ResumeRenderer sections={sections} templateId={resume.templateId} />
            </div>
          </div>
        </div>
      </div>

      {/*
        Off-screen render container.
        React renders the full-size (no zoom) resume here so cloneNode() in
        handleDownload always gets the latest content.
        position:fixed escapes overflow:hidden ancestors; visibility:hidden
        ensures it is never visible but still fully laid out by the browser.
      */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: '794px',         // 210 mm at 96 dpi — exact pixel width
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
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
