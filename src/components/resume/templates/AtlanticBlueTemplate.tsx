import type { ResumeData } from '@/types/resume';

interface Props { data: ResumeData; }

const SIDEBAR_BG  = '#1a2744';   // dark navy
const SIDEBAR_TXT = '#c8d6f0';   // light blue-white
const SIDEBAR_DIM = '#7a93bf';   // muted accent
const ACCENT_LINE = '#4a90c4';   // blue divider

const PROFICIENCY: Record<string, number> = {
  native: 5, fluent: 4, intermediate: 3, basic: 2,
};

function Dots({ level }: { level: string }) {
  const n = PROFICIENCY[level?.toLowerCase()] ?? 3;
  return (
    <span style={{ letterSpacing: '3px', fontSize: '9px', color: ACCENT_LINE }}>
      {'●'.repeat(n)}{'○'.repeat(5 - n)}
    </span>
  );
}

function SideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: ACCENT_LINE, marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ width: '30px', height: '2px', background: ACCENT_LINE, marginBottom: '10px' }} />
      {children}
    </div>
  );
}

function MainSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#1a2744', whiteSpace: 'nowrap' }}>
          {title}
        </h2>
        <div style={{ flex: 1, height: '1.5px', background: '#1a2744' }} />
      </div>
      {children}
    </div>
  );
}

export default function AtlanticBlueTemplate({ data }: Props) {
  const { overview, experience, education, projects, skills, languages } = data;

  return (
    <div style={{
      display: 'flex',
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '10px',
      lineHeight: '1.55',
      minHeight: '297mm',
      width: '210mm',
      boxSizing: 'border-box',
      background: '#fff',
    }}>

      {/* ══ LEFT SIDEBAR ══ */}
      <div style={{
        width: '36%',
        background: SIDEBAR_BG,
        padding: '32px 20px',
        color: SIDEBAR_TXT,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Avatar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: '#2d3f6a', border: `3px solid ${ACCENT_LINE}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: SIDEBAR_DIM, fontSize: '9px',
          }}>
            Photo
          </div>
        </div>

        {/* Name + Title */}
        {overview.fullName && (
          <h1 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.2 }}>
            {overview.fullName}
          </h1>
        )}
        {overview.title && (
          <p style={{ margin: '0 0 20px', fontSize: '10px', color: SIDEBAR_DIM, textAlign: 'center', fontStyle: 'italic' }}>
            {overview.title}
          </p>
        )}

        {/* Divider */}
        <div style={{ width: '100%', height: '1px', background: '#2d3f6a', marginBottom: '20px' }} />

        {/* Contact */}
        <div style={{ marginBottom: '20px' }}>
          {overview.email    && <div style={{ marginBottom: '5px', fontSize: '9.5px', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: ACCENT_LINE }}>✉</span>{overview.email}</div>}
          {overview.phone    && <div style={{ marginBottom: '5px', fontSize: '9.5px', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: ACCENT_LINE }}>✆</span>{overview.phone}</div>}
          {overview.location && <div style={{ marginBottom: '5px', fontSize: '9.5px', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: ACCENT_LINE }}>⌖</span>{overview.location}</div>}
          {overview.website  && <div style={{ marginBottom: '5px', fontSize: '9.5px', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: ACCENT_LINE }}>⊕</span>{overview.website}</div>}
        </div>

        {/* Profile */}
        {overview.summary && (
          <SideSection title="Profile">
            <p style={{ margin: 0, fontSize: '9.5px', color: SIDEBAR_TXT, lineHeight: '1.6' }}>{overview.summary}</p>
          </SideSection>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <SideSection title="Languages">
            {languages.map((item) => (
              <div key={item.id} style={{ marginBottom: '8px' }}>
                <div style={{ fontWeight: 600, fontSize: '9.5px', color: '#fff', marginBottom: '2px' }}>{item.language}</div>
                <Dots level={item.proficiency} />
              </div>
            ))}
          </SideSection>
        )}

        {/* Projects as Awards */}
        {projects.length > 0 && (
          <SideSection title="Projects">
            {projects.map((item) => (
              <div key={item.id} style={{ marginBottom: '8px' }}>
                <div style={{ fontWeight: 600, fontSize: '9.5px', color: '#fff' }}>{item.name}</div>
                {item.description && <div style={{ fontSize: '9px', color: SIDEBAR_DIM }}>{item.description}</div>}
              </div>
            ))}
          </SideSection>
        )}
      </div>

      {/* ══ RIGHT MAIN ══ */}
      <div style={{ flex: 1, padding: '32px 28px' }}>

        {/* Education */}
        {education.length > 0 && (
          <MainSection title="Education">
            {education.map((item) => (
              <div key={item.id} style={{ marginBottom: '12px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <div style={{ fontWeight: 700, fontSize: '11px' }}>{item.school}</div>
                {(item.degree || item.field) && (
                  <div style={{ color: '#444', fontSize: '10px', marginBottom: '1px' }}>
                    {[item.degree, item.field].filter(Boolean).join(', ')}
                  </div>
                )}
                {(item.startDate || item.endDate) && (
                  <div style={{ color: '#888', fontSize: '9.5px' }}>
                    {item.startDate}{item.startDate ? ' – ' : ''}{item.current ? 'Present' : item.endDate}
                  </div>
                )}
              </div>
            ))}
          </MainSection>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <MainSection title="Work Experience">
            {experience.map((item) => (
              <div key={item.id} style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '11px', color: '#111' }}>{item.position}</div>
                {item.company && (
                  <div style={{ fontSize: '10px', color: '#1a2744', fontWeight: 600, marginBottom: '2px' }}>
                    {item.company}
                    <span style={{ fontWeight: 400, color: '#888', marginLeft: '8px', fontSize: '9.5px' }}>
                      {item.startDate}{item.startDate ? ' – ' : ''}{item.current ? 'present' : item.endDate}
                    </span>
                  </div>
                )}
                {item.bullets.filter(Boolean).length > 0 && (
                  <ul style={{ margin: '4px 0 0 14px', padding: 0 }}>
                    {item.bullets.filter(Boolean).map((b, i) => (
                      <li key={i} style={{ marginBottom: '2px', color: '#333' }}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </MainSection>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <MainSection title="Skills">
            {skills.map((cat) => (
              <div key={cat.id} style={{ marginBottom: '6px' }}>
                {cat.skills.map((s, i) => (
                  <div key={i} style={{ color: '#333', marginBottom: '2px' }}>• {s}</div>
                ))}
              </div>
            ))}
          </MainSection>
        )}
      </div>
    </div>
  );
}
