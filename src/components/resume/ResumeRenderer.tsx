import { useEffect, useRef, useState } from 'react';
import { parseSections } from '@/types/resume';
import type { ResumeSectionDto } from '@/types/resume';
import ClassicTemplate      from './templates/ClassicTemplate';
import ModernTemplate       from './templates/ModernTemplate';
import MinimalTemplate      from './templates/MinimalTemplate';
import MercuryTemplate      from './templates/MercuryTemplate';
import AtlanticBlueTemplate from './templates/AtlanticBlueTemplate';
import SageGreenTemplate    from './templates/SageGreenTemplate';

interface Props {
  sections: ResumeSectionDto[];
  templateId: number | null;
}

// ─── Page-break visualiser ────────────────────────────────────────────────────
// Wraps a template and draws a visual dashed line + "Page N" label at every
// 297mm boundary so the user can see where A4 pages fall in the live preview.
// Has no effect when printing (lines are hidden via @media print).

function ResumePageView({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [breakPositions, setBreakPositions] = useState<number[]>([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const recalc = () => {
      // 210mm wide → derive px-per-mm from actual rendered offsetWidth
      const pxPerMm  = el.offsetWidth / 210;
      const pageH    = Math.round(pxPerMm * 297); // px for one A4 page
      const totalH   = el.scrollHeight;

      if (pageH <= 0 || totalH <= pageH) {
        setBreakPositions([]);
        return;
      }

      const breaks: number[] = [];
      let pos = pageH;
      while (pos < totalH - 4) {          // -4 px tolerance so we don't add a break at the very end
        breaks.push(pos);
        pos += pageH;
      }
      setBreakPositions(breaks);
    };

    // Run once after mount, then observe size changes (e.g. when user types)
    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {children}

      {/* Page-break lines — hidden on @media print */}
      {breakPositions.map((top, i) => (
        <div
          key={top}
          className="resume-page-break-line"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top,
            height: 0,
            borderTop: '2px dashed #94a3b8',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          {/* Label */}
          <span style={{
            position: 'absolute',
            right: 6,
            top: -10,
            fontSize: '9px',
            fontFamily: 'sans-serif',
            fontWeight: 600,
            color: '#64748b',
            background: '#f1f5f9',
            padding: '1px 5px',
            borderRadius: '3px',
            lineHeight: '16px',
            userSelect: 'none',
          }}>
            Page {i + 2}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main renderer ────────────────────────────────────────────────────────────

export default function ResumeRenderer({ sections, templateId }: Props) {
  const data = parseSections(sections);

  let template: React.ReactNode;
  switch (templateId) {
    case 2:  template = <ModernTemplate       data={data} />; break;
    case 3:  template = <MinimalTemplate      data={data} />; break;
    case 4:  template = <MercuryTemplate      data={data} />; break;
    case 5:  template = <AtlanticBlueTemplate data={data} />; break;
    case 6:  template = <SageGreenTemplate    data={data} />; break;
    case 1:
    default: template = <ClassicTemplate      data={data} />; break;
  }

  return <ResumePageView>{template}</ResumePageView>;
}
