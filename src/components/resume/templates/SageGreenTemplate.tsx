import type { ResumeData } from '@/types/resume';

interface Props { data: ResumeData; }

const SIDEBAR_BG  = '#2d4a3e';   // dark sage green
const SIDEBAR_TXT = '#c8ddd4';
const SIDEBAR_DIM = '#7aaa90';
const ACCENT      = '#3d6b58';   // lighter sage for sub-headers

export default function SageGreenTemplate({ data }: Props) {
  const { overview, experience, education, projects, skills, languages } = data;

  return (
    <div style={{
      display: 'flex',
      fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
      fontSize: '10px',
      lineHeight: '1.6',
      minHeight: '297mm',
      width: '210mm',
      boxSizing: 'border-box',
      background: '#fff',
    }}>

      {/* ══ LEFT SIDEBAR ══ */}
      <div style={{
        width: '38%',
        background: SIDEBAR_BG,
        padding: '36px 22px',
        color: SIDEBAR_TXT,
        flexShrink: 0,
      }}>
        {/* Name */}
        {overview.fullName && (
          <h1 style={{
            margin: '0 0 2px',
            fontSize: '20px',
            fontWeight: 700,
            fontStyle: 'italic',
            fontFamily: 'Georgia, serif',
            color: '#fff',
            lineHeight: 1.2,
          }}>
            {overview.fullName}
          </h1>
        )}
        {overview.title && (
          <p style={{ margin: '0 0 20px', fontSize: '10.5px', color: SIDEBAR_DIM, fontStyle: 'italic' }}>
            {overview.title}
          </p>
        )}

        {/* Divider */}
        <div style={{ width: '40px', height: '2px', background: SIDEBAR_DIM, marginBottom: '18px' }} />

        {/* Contact */}
        <div style={{ marginBottom: '22px' }}>
          {overview.email    && <div style={{ marginBottom: '6px', fontSize: '9.5px', display: 'flex', gap: '7px' }}><span style={{ color: SIDEBAR_DIM }}>✉</span><span>{overview.email}</span></div>}
          {overview.phone    && <div style={{ marginBottom: '6px', fontSize: '9.5px', display: 'flex', gap: '7px' }}><span style={{ color: SIDEBAR_DIM }}>✆</span><span>{overview.phone}</span></div>}
          {overview.location && <div style={{ marginBottom: '6px', fontSize: '9.5px', display: 'flex', gap: '7px' }}><span style={{ color: SIDEBAR_DIM }}>⌖</span><span>{overview.location}</span></div>}
          {overview.website  && <div style={{ marginBottom: '6px', fontSize: '9.5px', display: 'flex', gap: '7px' }}><span style={{ color: SIDEBAR_DIM }}>⊕</span><span>{overview.website}</span></div>}
        </div>

        {/* Profile */}
        {overview.summary && (
          <SideBlock title="Profile">
            <p style={{ margin: 0, fontSize: '9.5px', color: SIDEBAR_TXT, lineHeight: '1.65' }}>{overview.summary}</p>
          </SideBlock>
        )}

        {/* Education */}
        {education.length > 0 && (
          <SideBlock title="Education">
            {education.map((item) => (
              <div key={item.id} style={{ marginBottom: '12px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <div style={{ fontWeight: 700, fontSize: '10px', color: '#fff' }}>
                  {[item.degree, item.field].filter(Boolean).join(', ')}
                </div>
                <div style={{ fontSize: '9.5px', color: SIDEBAR_TXT }}>{item.school}</div>
                {(item.startDate || item.endDate) && (
                  <div style={{ fontSize: '9px', color: SIDEBAR_DIM }}>
                    {item.startDate}{item.startDate ? ' – ' : ''}{item.current ? 'Present' : item.endDate}
                  </div>
                )}
              </div>
            ))}
          </SideBlock>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <SideBlock title="Languages">
            {languages.map((item) => (
              <div key={item.id} style={{ marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '9.5px', color: '#fff' }}>•</span>
                <span style={{ fontSize: '9.5px' }}>{item.language}</span>
                {item.proficiency && (
                  <span style={{ fontSize: '9px', color: SIDEBAR_DIM, fontStyle: 'italic' }}>({item.proficiency})</span>
                )}
              </div>
            ))}
          </SideBlock>
        )}
      </div>

      {/* ══ RIGHT MAIN ══ */}
      <div style={{ flex: 1, padding: '36px 28px' }}>

        {/* Experience */}
        {experience.length > 0 && (
          <MainBlock title="Professional Experience" accent={ACCENT}>
            {experience.map((item) => (
              <div key={item.id} style={{ marginBottom: '18px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                  <div style={{ fontWeight: 700, fontSize: '11.5px', color: '#1a1a1a' }}>
                    {item.position}
                    {item.company && (
                      <span style={{ fontWeight: 400, color: '#666', fontSize: '10px' }}>, {item.company}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '9.5px', color: '#888', whiteSpace: 'nowrap' }}>
                    {item.startDate}{item.startDate ? ' – ' : ''}{item.current ? 'Present' : item.endDate}
                  </div>
                </div>
                {item.bullets.filter(Boolean).length > 0 && (
                  <ul style={{ margin: '5px 0 0 14px', padding: 0 }}>
                    {item.bullets.filter(Boolean).map((b, i) => (
                      <li key={i} style={{ marginBottom: '3px', color: '#333' }}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </MainBlock>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <MainBlock title="Skills" accent={ACCENT}>
            {skills.map((cat) => (
              <div key={cat.id} style={{ marginBottom: '8px' }}>
                {cat.name && (
                  <div style={{ fontWeight: 700, fontSize: '10px', color: ACCENT, marginBottom: '3px' }}>{cat.name}</div>
                )}
                {cat.skills.map((s, i) => (
                  <div key={i} style={{ color: '#333', marginBottom: '2px' }}>• {s}</div>
                ))}
              </div>
            ))}
          </MainBlock>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <MainBlock title="Projects & Awards" accent={ACCENT}>
            {projects.map((item) => (
              <div key={item.id} style={{ marginBottom: '10px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <div style={{ fontWeight: 700, fontSize: '10.5px', color: '#1a1a1a' }}>
                  {item.name}
                  {item.url && <span style={{ fontWeight: 400, fontSize: '9px', color: '#888', marginLeft: '6px' }}>{item.url}</span>}
                </div>
                {item.description && <div style={{ color: '#444', fontSize: '9.5px', fontStyle: 'italic' }}>{item.description}</div>}
              </div>
            ))}
          </MainBlock>
        )}
      </div>
    </div>
  );
}

function SideBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '22px' }}>
      <h3 style={{
        margin: '0 0 10px',
        fontSize: '9px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '2px',
        color: '#fff',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        paddingBottom: '5px',
      }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function MainBlock({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '22px' }}>
      <h2 style={{
        margin: '0 0 12px',
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        color: accent,
        borderBottom: `2px solid ${accent}`,
        paddingBottom: '5px',
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
