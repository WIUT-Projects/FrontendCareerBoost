import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Download, Loader2, ArrowLeft, Save,
  User, GraduationCap, Briefcase, FolderOpen, Code2, Languages,
} from 'lucide-react';
import { AiReviewButton } from '@/components/resume/AiReviewButton';
import { AiAnalysisPanel } from '@/components/resume/AiAnalysisPanel';
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
import { analyzeResume, getLatestAnalysis } from '@/services/aiService';
import type { AiAnalysisResult } from '@/services/aiService';
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
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AiAnalysisResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAiReview = async () => {
    if (!session || !id) return;
    setAiPanelOpen(true);
    setAnalyzing(true);
    setAiError(null);
    try {
      const result = await analyzeResume(Number(id), session.accessToken);
      setAiResult(result);
    } catch (e: any) {
      setAiError(e?.message ?? 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Load latest saved result when panel first opens (without re-running)
  const aiPanelOpenedOnce = useRef(false);
  useEffect(() => {
    if (!aiPanelOpen || aiPanelOpenedOnce.current || !session || !id) return;
    aiPanelOpenedOnce.current = true;
    getLatestAnalysis(Number(id), session.accessToken)
      .then((r) => { if (r) setAiResult(r); })
      .catch(() => null);
  }, [aiPanelOpen]);

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

      // Measure the template's top padding so we can replicate it on continuation pages.
      // captureEl > clone (pdfRef div) > template root div
      const templateRoot = captureEl.firstElementChild?.firstElementChild as HTMLElement | null;
      const rawPaddingTopDom = templateRoot
        ? parseFloat(getComputedStyle(templateRoot).paddingTop) || 0
        : 0;

      const fullHeight   = captureEl.scrollHeight;
      const captureWidth = captureEl.offsetWidth; // should be 794px

      // --- Step 2: measure DOM positions of "no-split" blocks BEFORE capturing ---
      // html2canvas scale=2 so canvas pixels = DOM pixels × 2
      const SCALE = 2;
      const captureRect = captureEl.getBoundingClientRect();

      // a4PageH in DOM pixels (pre-scale), used for block filtering
      const a4PageHDom = Math.round((297 / 210) * captureWidth);

      // Collect every element marked as break-inside:avoid
      const safeBlocksDom: Array<{ top: number; bottom: number }> = [];
      captureEl.querySelectorAll<HTMLElement>('div').forEach(el => {
        const s = el.style;
        if (s.breakInside === 'avoid' || s.pageBreakInside === 'avoid') {
          const r   = el.getBoundingClientRect();
          const top = r.top    - captureRect.top;
          const bot = r.bottom - captureRect.top;
          // Only track blocks smaller than 85 % of one page (otherwise unsplittable anyway)
          if (bot > top && (bot - top) < a4PageHDom * 0.85) {
            safeBlocksDom.push({ top, bottom: bot });
          }
        }
      });

      // --- Step 3: capture full-height canvas ---
      const canvas = await html2canvas(captureEl, {
        scale: SCALE,
        useCORS: true,
        logging: false,
        windowWidth:  captureWidth,
        windowHeight: fullHeight,
        height:       fullHeight,
        scrollX: 0,
        scrollY: 0,
      });

      // Clean up the temporary DOM node immediately after capture
      document.body.removeChild(captureEl);

      // --- Step 4: calculate smart (block-aware) page break positions ---
      const PAGE_W_MM = 210;
      const PAGE_H_MM = 297;
      // Convert DOM-pixel blocks to canvas-pixel blocks
      const safeBlocks = safeBlocksDom.map(b => ({
        top:    b.top    * SCALE,
        bottom: b.bottom * SCALE,
      }));

      const a4PageHPx = Math.round((PAGE_H_MM / PAGE_W_MM) * canvas.width);

      // For pages 2+, we'll prepend a top-margin strip matching the template's own padding,
      // so the continuation pages look identical in spacing to page 1.
      const topMarginCanvasPx = Math.round(rawPaddingTopDom * SCALE);
      // Capacity for a continuation page is reduced by that top margin
      const contPageCapacity  = Math.max(
        a4PageHPx - topMarginCanvasPx,
        Math.round(a4PageHPx * 0.5),  // never shrink below 50 % of A4 height
      );

      // Build list of {start, end} slices that respect block boundaries
      const slices: Array<{ start: number; end: number }> = [];
      let currentY     = 0;
      let isFirstSlice = true;

      while (currentY < canvas.height) {
        const pageCapacity = isFirstSlice ? a4PageHPx : contPageCapacity;
        let breakAt = currentY + pageCapacity;

        if (breakAt >= canvas.height) {
          // Last (possibly partial) page
          slices.push({ start: currentY, end: canvas.height });
          break;
        }

        // Move break point UP if it falls inside a "safe" block
        for (const block of safeBlocks) {
          if (block.top < breakAt && block.bottom > breakAt) {
            // This block straddles the cut line — move the cut to just before the block,
            // but only if doing so leaves enough content on the current page (>20 %).
            const candidate = block.top - 2;
            if (candidate > currentY + pageCapacity * 0.2) {
              breakAt = Math.min(breakAt, candidate);
            }
            // else: block starts too early, can't avoid the split — leave breakAt as-is
          }
        }

        slices.push({ start: currentY, end: breakAt });
        currentY     = breakAt;
        isFirstSlice = false;
      }

      // --- Step 5: build multi-page PDF ---
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      slices.forEach(({ start, end }, pageIdx) => {
        if (pageIdx > 0) pdf.addPage();
        const sliceH = end - start;
        // Pages 2+: prepend a white strip of height = template top padding,
        // so content doesn't start at the very edge of the paper.
        const topPad = pageIdx === 0 ? 0 : topMarginCanvasPx;
        const tmp    = document.createElement('canvas');
        tmp.width    = canvas.width;
        tmp.height   = topPad + sliceH;
        const ctx    = tmp.getContext('2d');
        if (ctx) {
          if (topPad > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, tmp.width, topPad);
          }
          ctx.drawImage(canvas, 0, start, canvas.width, sliceH, 0, topPad, canvas.width, sliceH);
        }
        const tmpHMm = (tmp.height / canvas.width) * PAGE_W_MM;
        pdf.addImage(tmp.toDataURL('image/png'), 'PNG', 0, 0, PAGE_W_MM, tmpHMm);
      });

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
              <AiReviewButton variant="icon" size="sm" onClick={handleAiReview} />
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
            <AiReviewButton size="sm" onClick={handleAiReview} />
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

      {/* AI Analysis drawer */}
      <AiAnalysisPanel
        open={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        onRerun={handleAiReview}
        analyzing={analyzing}
        result={aiResult}
        error={aiError}
      />
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
