import type { ResumeData } from '@/types/resume';

type Props = { data: ResumeData };

// ─── Design tokens ────────────────────────────────────────────────────────────
const HEADER_BG  = '#171717';
const GOLD       = '#c8a84b';
const BODY_BG    = '#ffffff';
const TEXT_DARK  = '#1a1a1a';
const TEXT_MID   = '#444444';
const TEXT_LIGHT = '#888888';

// ─── Leaf decoration (tropical silhouettes on dark header) ───────────────────
function LeafDecor() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', right: 0, top: 0, width: '52%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 210 230"
      preserveAspectRatio="xMaxYMid slice"
    >
      {/* Background ambient glow */}
      <ellipse cx="170" cy="115" rx="80" ry="100" fill="#2a4a10" opacity="0.25" />

      {/* Leaf 1 — large center leaf */}
      <path
        d="M130,10 C165,10 195,45 192,85 C189,125 168,150 140,148
           C115,146 95,125 96,95 C97,65 100,30 130,10 Z"
        fill="#2d5a18" opacity="0.70"
      />
      {/* Leaf 1 midrib */}
      <line x1="130" y1="10" x2="118" y2="148" stroke="#1a3a0a" strokeWidth="1.5" opacity="0.5" />

      {/* Leaf 2 — right tall leaf */}
      <path
        d="M175,0 C200,15 215,55 210,95 C205,135 185,158 165,155
           C145,152 130,130 135,100 C140,70 148,18 175,0 Z"
        fill="#1e4010" opacity="0.80"
      />
      <line x1="175" y1="0" x2="155" y2="155" stroke="#122808" strokeWidth="1.2" opacity="0.4" />

      {/* Leaf 3 — lower-left mid leaf */}
      <path
        d="M95,90 C128,80 160,105 162,140 C164,175 142,200 115,198
           C88,196 68,170 72,140 C76,112 62,100 95,90 Z"
        fill="#3a6820" opacity="0.60"
      />
      <line x1="95" y1="90" x2="112" y2="198" stroke="#1e3c0e" strokeWidth="1.2" opacity="0.4" />

      {/* Leaf 4 — bottom right accent */}
      <path
        d="M165,140 C195,132 215,160 210,195 C205,230 185,245 162,240
           C139,235 122,210 128,185 C134,160 138,148 165,140 Z"
        fill="#254e12" opacity="0.75"
      />
      <line x1="165" y1="140" x2="148" y2="240" stroke="#142c0a" strokeWidth="1" opacity="0.4" />

      {/* Leaf 5 — top right small */}
      <path
        d="M190,5 C210,18 222,45 218,72 C214,99 198,115 180,112
           C162,109 150,90 155,68 C160,46 168,8 190,5 Z"
        fill="#4a7a28" opacity="0.50"
      />

      {/* Fine stem lines for detail */}
      <line x1="140" y1="80"  x2="180" y2="60"  stroke="#2a5010" strokeWidth="0.8" opacity="0.3" />
      <line x1="130" y1="110" x2="165" y2="100" stroke="#2a5010" strokeWidth="0.8" opacity="0.3" />
      <line x1="115" y1="140" x2="155" y2="135" stroke="#2a5010" strokeWidth="0.8" opacity="0.3" />
    </svg>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: TEXT_DARK }}>
          {title}
        </span>
        <div style={{ height: 2, background: `linear-gradient(90deg, ${GOLD} 0%, ${GOLD}55 60%, transparent 100%)`, marginTop: 3, borderRadius: 1 }} />
      </div>
      {children}
    </div>
  );
}

// ─── Pill badge (certs / languages) ──────────────────────────────────────────
function Pill({ label, dark = false }: { label: string; dark?: boolean }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 9,
      fontWeight: 600,
      marginRight: 6,
      marginBottom: 6,
      background: dark ? TEXT_DARK : '#f0ece4',
      color: dark ? '#e8e0cc' : TEXT_MID,
      border: dark ? 'none' : `1px solid #d4c89a`,
    }}>
      {label}
    </span>
  );
}

// ─── Skill bar ────────────────────────────────────────────────────────────────
function SkillBar({ name }: { name: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 9, fontWeight: 600, color: TEXT_DARK, marginBottom: 3 }}>{name}</div>
      <div style={{ height: 2, background: '#e0d8c8', borderRadius: 1 }}>
        <div style={{ height: '100%', width: '75%', background: GOLD, borderRadius: 1 }} />
      </div>
    </div>
  );
}

// ─── Contact icon chip ────────────────────────────────────────────────────────
function ContactChip({ icon, text }: { icon: string; text: string }) {
  if (!text) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 14, fontSize: 9, color: '#c8c0b4' }}>
      <span style={{ fontSize: 10 }}>{icon}</span>{text}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function BlackPatternTemplate({ data }: Props) {
  const { overview, experience, education, projects, skills, languages } = data;
  const allSkills = skills.flatMap(s => s.skills);

  return (
    <div style={{ width: '210mm', background: BODY_BG, fontFamily: "'Segoe UI', Arial, sans-serif", color: TEXT_DARK, fontSize: 10 }}>

      {/* ── Header ── */}
      <div style={{ position: 'relative', background: HEADER_BG, padding: '28px 30px 24px', overflow: 'hidden', minHeight: 110 }}>
        <LeafDecor />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '58%' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
            {overview.fullName || 'Your Name'}
          </div>
          {overview.title && (
            <div style={{ fontSize: 12, fontWeight: 400, color: '#a8a090', marginTop: 4 }}>
              {overview.title}
            </div>
          )}
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: '2px 0' }}>
            <ContactChip icon="📍" text={overview.location} />
            <ContactChip icon="📞" text={overview.phone} />
            <ContactChip icon="✉" text={overview.email} />
            <ContactChip icon="🌐" text={overview.website} />
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '22px 28px 28px' }}>

        {/* Profile */}
        {overview.summary && (
          <Section title="Profile">
            <p style={{ fontSize: 10, color: TEXT_MID, lineHeight: 1.6, margin: 0 }}>
              {overview.summary}
            </p>
          </Section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <Section title="Professional Experience">
            {experience.map((e) => (
              <div key={e.id} style={{ marginBottom: 12, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: TEXT_DARK }}>{e.company}</span>
                  <span style={{ fontSize: 9, color: TEXT_LIGHT, flexShrink: 0, marginLeft: 8 }}>
                    {e.startDate}{e.current ? ' – Present' : e.endDate ? ` – ${e.endDate}` : ''}
                    {e.position && ` | ${e.position}`}
                  </span>
                </div>
                {e.position && (
                  <div style={{ fontSize: 10, fontStyle: 'italic', color: TEXT_MID, marginTop: 1 }}>{e.position}</div>
                )}
                {e.bullets?.length > 0 && (
                  <ul style={{ margin: '4px 0 0', paddingLeft: 14 }}>
                    {e.bullets.map((b, i) => (
                      <li key={i} style={{ fontSize: 9.5, color: TEXT_MID, lineHeight: 1.55, marginBottom: 2 }}>{b}</li>
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
            {education.map((e) => (
              <div key={e.id} style={{ marginBottom: 8, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 10, fontWeight: 700 }}>{e.degree}{e.field ? `, ${e.field}` : ''}</span>
                  <span style={{ fontSize: 9, color: TEXT_LIGHT, flexShrink: 0, marginLeft: 8 }}>
                    {e.startDate}{e.current ? ' – Present' : e.endDate ? ` – ${e.endDate}` : ''}
                  </span>
                </div>
                <div style={{ fontSize: 9.5, color: TEXT_MID }}>{e.school}</div>
              </div>
            ))}
          </Section>
        )}

        {/* Projects (as achievements/certificates visually) */}
        {projects.length > 0 && (
          <Section title="Projects">
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {projects.map((p) => (
                <Pill key={p.id} label={p.name} dark />
              ))}
            </div>
            {projects.some(p => p.description || p.bullets?.length > 0) && (
              <div style={{ marginTop: 6 }}>
                {projects.map((p) => (p.description || p.bullets?.length > 0) && (
                  <div key={p.id} style={{ marginBottom: 6, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div style={{ fontSize: 10, fontWeight: 600 }}>{p.name}{p.url ? ` — ${p.url}` : ''}</div>
                    {p.description && <div style={{ fontSize: 9.5, color: TEXT_MID }}>{p.description}</div>}
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <Section title="Languages">
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {languages.map((l) => (
                <Pill key={l.id} label={l.proficiency ? `${l.language} (${l.proficiency})` : l.language} />
              ))}
            </div>
          </Section>
        )}

        {/* Skills — 2-column bars */}
        {allSkills.length > 0 && (
          <Section title="Skills">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
              {allSkills.map((sk) => (
                <SkillBar key={sk} name={sk} />
              ))}
            </div>
          </Section>
        )}

      </div>
    </div>
  );
}
