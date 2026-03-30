import type { ResumeData } from '@/types/resume';

type Props = { data: ResumeData };

// ─── Design tokens ────────────────────────────────────────────────────────────
const PURPLE      = '#7c3aed';
const PURPLE_SOFT = '#a78bfa';
const PURPLE_BG   = '#ede8ff';
const HEADER_BG   = '#f0ecfa';
const TEXT_DARK   = '#1e1b2e';
const TEXT_MID    = '#4a4560';
const TEXT_LIGHT  = '#8b82a8';

// ─── Bokeh decoration ────────────────────────────────────────────────────────
function BokehDecor() {
  const circles = [
    { r: 55, x: '78%',  y: -10, opacity: 0.18, color: '#c4b5fd' },
    { r: 38, x: '88%',  y: 35,  opacity: 0.14, color: '#a78bfa' },
    { r: 28, x: '68%',  y: 50,  opacity: 0.10, color: '#ddd6fe' },
    { r: 18, x: '92%',  y: 5,   opacity: 0.22, color: '#ede9fe' },
    { r: 12, x: '74%',  y: 20,  opacity: 0.15, color: '#c4b5fd' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {circles.map((c, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: c.x,
          top: c.y,
          width: c.r * 2,
          height: c.r * 2,
          borderRadius: '50%',
          background: c.color,
          opacity: c.opacity,
          filter: `blur(${Math.round(c.r * 0.35)}px)`,
          transform: 'translateX(-50%)',
        }} />
      ))}
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ marginBottom: 7 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: PURPLE, letterSpacing: '0.5px' }}>
          {title}
        </span>
        <div style={{ height: 2, background: `linear-gradient(90deg, ${PURPLE} 0%, ${PURPLE_SOFT} 40%, transparent 100%)`, marginTop: 3, borderRadius: 1 }} />
      </div>
      {children}
    </div>
  );
}

// ─── Contact item ─────────────────────────────────────────────────────────────
function ContactItem({ icon, text }: { icon: string; text: string }) {
  if (!text) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 16, fontSize: 9, color: TEXT_MID }}>
      <span style={{ fontSize: 10, color: PURPLE }}>{icon}</span>
      {text}
    </span>
  );
}

// ─── Proficiency dots ────────────────────────────────────────────────────────
function ProfDots({ level }: { level: string }) {
  const map: Record<string, number> = { native: 5, fluent: 4, intermediate: 3, basic: 2 };
  const filled = map[level] ?? 3;
  return (
    <span style={{ display: 'inline-flex', gap: 2, marginLeft: 6 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{
          display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
          background: i <= filled ? PURPLE : '#d8d0f0',
        }} />
      ))}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LavenderTemplate({ data }: Props) {
  const { overview, experience, education, projects, skills, languages } = data;

  return (
    <div style={{ width: '210mm', background: '#ffffff', fontFamily: "'Segoe UI', Arial, sans-serif", color: TEXT_DARK, fontSize: 10 }}>

      {/* ── Header ── */}
      <div style={{ position: 'relative', background: HEADER_BG, padding: '28px 32px 22px', overflow: 'hidden' }}>
        <BokehDecor />

        {/* Decorative left accent bar */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: `linear-gradient(180deg, ${PURPLE} 0%, ${PURPLE_SOFT} 100%)` }} />

        <div style={{ position: 'relative', zIndex: 1, paddingLeft: 8 }}>
          {/* Name row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: TEXT_DARK, margin: 0, letterSpacing: '-0.5px', lineHeight: 1 }}>
              {overview.fullName || 'Your Name'}
            </h1>
            {overview.title && (
              <span style={{ fontSize: 13, fontWeight: 500, color: PURPLE, letterSpacing: '0.2px' }}>
                {overview.title}
              </span>
            )}
          </div>

          {/* Contact row */}
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: '3px 0' }}>
            <ContactItem icon="📍" text={overview.location} />
            <ContactItem icon="✉"  text={overview.email} />
            <ContactItem icon="📞" text={overview.phone} />
            <ContactItem icon="🌐" text={overview.website} />
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '22px 32px 32px', paddingLeft: 37 /* align with header content */ }}>

        {/* Profile */}
        {overview.summary && (
          <Section title="Profile">
            <p style={{ fontSize: 10, color: TEXT_MID, lineHeight: 1.65, margin: 0 }}>
              {overview.summary}
            </p>
          </Section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <Section title="Professional Experience">
            {experience.map((e, idx) => (
              <div key={e.id} style={{ marginBottom: idx < experience.length - 1 ? 12 : 0, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                {/* Title + date */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: TEXT_DARK }}>{e.position}</span>
                  <span style={{ fontSize: 9, color: TEXT_LIGHT, flexShrink: 0, marginLeft: 10 }}>
                    {e.startDate}
                    {e.current ? ' – Present' : e.endDate ? ` – ${e.endDate}` : ''}
                  </span>
                </div>
                {/* Company + location */}
                <div style={{ fontSize: 9.5, color: PURPLE, fontStyle: 'italic', marginTop: 1 }}>
                  {e.company}
                </div>
                {/* Bullets */}
                {e.bullets?.length > 0 && (
                  <ul style={{ margin: '5px 0 0', paddingLeft: 14 }}>
                    {e.bullets.map((b, i) => (
                      <li key={i} style={{ fontSize: 9.5, color: TEXT_MID, lineHeight: 1.6, marginBottom: 2 }}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <Section title="Education">
            {education.map((e, idx) => (
              <div key={e.id} style={{ marginBottom: idx < education.length - 1 ? 8 : 0, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700 }}>{e.school}</span>
                  <span style={{ fontSize: 9, color: TEXT_LIGHT, flexShrink: 0, marginLeft: 10 }}>
                    {e.startDate}{e.current ? ' – Present' : e.endDate ? ` – ${e.endDate}` : ''}
                  </span>
                </div>
                {(e.degree || e.field) && (
                  <div style={{ fontSize: 9.5, color: TEXT_MID, fontStyle: 'italic' }}>
                    {[e.degree, e.field].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <Section title="Languages">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 24px' }}>
              {languages.map((l) => (
                <span key={l.id} style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, color: TEXT_MID }}>
                  <span style={{ fontWeight: 600 }}>{l.language}</span>
                  <ProfDots level={l.proficiency} />
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <Section title="Skills">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
              {skills.map((cat) => (
                <div key={cat.id} style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: PURPLE, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {cat.name}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {cat.skills.map((sk) => (
                      <span key={sk} style={{
                        fontSize: 9,
                        padding: '2px 8px',
                        borderRadius: 10,
                        background: PURPLE_BG,
                        color: PURPLE,
                        fontWeight: 500,
                      }}>
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <Section title="Projects">
            {projects.map((p, idx) => (
              <div key={p.id} style={{ marginBottom: idx < projects.length - 1 ? 10 : 0, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: TEXT_DARK }}>{p.name}</span>
                  {p.url && <span style={{ fontSize: 9, color: PURPLE_SOFT, flexShrink: 0, marginLeft: 8 }}>{p.url}</span>}
                </div>
                {p.technologies?.length > 0 && (
                  <div style={{ fontSize: 9, color: TEXT_LIGHT, marginTop: 1 }}>
                    {p.technologies.join(' · ')}
                  </div>
                )}
                {p.description && (
                  <p style={{ fontSize: 9.5, color: TEXT_MID, margin: '3px 0 0', lineHeight: 1.55 }}>{p.description}</p>
                )}
                {p.bullets?.length > 0 && (
                  <ul style={{ margin: '4px 0 0', paddingLeft: 14 }}>
                    {p.bullets.map((b, i) => (
                      <li key={i} style={{ fontSize: 9.5, color: TEXT_MID, lineHeight: 1.55, marginBottom: 2 }}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </Section>
        )}

      </div>
    </div>
  );
}
