import { useEffect, useRef, useState } from 'react';
import { parseSections } from '@/types/resume';
import type { ResumeSectionDto, ResumeData } from '@/types/resume';
import ClassicTemplate      from './templates/ClassicTemplate';
import ModernTemplate       from './templates/ModernTemplate';
import MinimalTemplate      from './templates/MinimalTemplate';
import MercuryTemplate      from './templates/MercuryTemplate';
import AtlanticBlueTemplate from './templates/AtlanticBlueTemplate';
import SageGreenTemplate    from './templates/SageGreenTemplate';
import BlackPatternTemplate from './templates/BlackPatternTemplate';
import LavenderTemplate     from './templates/LavenderTemplate';

interface Props {
  sections: ResumeSectionDto[];
  /** DB template id — used as fallback when templateName is absent */
  templateId?: number | null;
  /** Template name returned by the API (preferred selector) */
  templateName?: string | null;
}

// ─── Name → component map (primary lookup) ───────────────────────────────────
// Keys must match the `Name` column in the ResumeTemplates table exactly.
type TemplateComponent = React.ComponentType<{ data: ResumeData }>;

const BY_NAME: Record<string, TemplateComponent> = {
  'Classic':       ClassicTemplate,
  'Modern':        ModernTemplate,
  'Minimal':       MinimalTemplate,
  'Mercury':       MercuryTemplate,
  'Atlantic Blue': AtlanticBlueTemplate,
  'Sage Green':    SageGreenTemplate,
  'Black Pattern': BlackPatternTemplate,
  'Lavender':      LavenderTemplate,
};

// ─── ID → component map (legacy / editor fallback) ───────────────────────────
const BY_ID: Record<number, TemplateComponent> = {
  1: ClassicTemplate,
  2: ModernTemplate,
  3: MinimalTemplate,
  4: MercuryTemplate,
  5: AtlanticBlueTemplate,
  6: SageGreenTemplate,
  7: BlackPatternTemplate,
  8: LavenderTemplate,
};

function resolveTemplate(
  templateName?: string | null,
  templateId?: number | null,
): TemplateComponent {
  if (templateName) {
    const byName = BY_NAME[templateName];
    if (byName) return byName;
  }
  if (templateId != null) {
    const byId = BY_ID[templateId];
    if (byId) return byId;
  }
  return ClassicTemplate;
}

// ─── Page-break visualiser ────────────────────────────────────────────────────
function ResumePageView({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [breakPositions, setBreakPositions] = useState<number[]>([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const recalc = () => {
      const pxPerMm = el.offsetWidth / 210;
      const pageH   = Math.round(pxPerMm * 297);
      const totalH  = el.scrollHeight;

      if (pageH <= 0 || totalH <= pageH) { setBreakPositions([]); return; }

      const breaks: number[] = [];
      let pos = pageH;
      while (pos < totalH - 4) { breaks.push(pos); pos += pageH; }
      setBreakPositions(breaks);
    };

    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {children}
      {breakPositions.map((top, i) => (
        <div
          key={top}
          className="resume-page-break-line"
          style={{ position: 'absolute', left: 0, right: 0, top, height: 0,
            borderTop: '2px dashed #94a3b8', zIndex: 20, pointerEvents: 'none' }}
        >
          <span style={{ position: 'absolute', right: 6, top: -10, fontSize: '9px',
            fontFamily: 'sans-serif', fontWeight: 600, color: '#64748b',
            background: '#f1f5f9', padding: '1px 5px', borderRadius: '3px',
            lineHeight: '16px', userSelect: 'none' }}>
            Page {i + 2}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main renderer ────────────────────────────────────────────────────────────
export default function ResumeRenderer({ sections, templateId, templateName }: Props) {
  const data = parseSections(sections);
  const TemplateComponent = resolveTemplate(templateName, templateId);
  return <ResumePageView><TemplateComponent data={data} /></ResumePageView>;
}
