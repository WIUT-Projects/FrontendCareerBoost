import type { ResumeData } from '@/types/resume';

interface Props {
  data: ResumeData;
}

const ACCENT = '#2563eb'; // blue-600

export default function ModernTemplate({ data }: Props) {
  const { overview, education, experience, projects, skills, languages } = data;

  return (
    <div
      style={{
        fontFamily: '"Inter", "Segoe UI", Arial, sans-serif',
        fontSize: '11px',
        lineHeight: '1.55',
        minHeight: '297mm',
        width: '210mm',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        color: '#1a1a1a',
      }}
    >
      {/* Colored header */}
      <div
        style={{
          background: ACCENT,
          color: '#fff',
          padding: '28px 40px 24px',
        }}
      >
        {overview.fullName && (
          <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0, letterSpacing: '0.5px' }}>
            {overview.fullName}
          </h1>
        )}
        {overview.title && (
          <p style={{ fontSize: '13px', margin: '4px 0 12px', opacity: 0.85 }}>{overview.title}</p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '10px', opacity: 0.9 }}>
          {overview.email && <span>✉ {overview.email}</span>}
          {overview.phone && <span>📞 {overview.phone}</span>}
          {overview.location && <span>📍 {overview.location}</span>}
          {overview.website && <span>🌐 {overview.website}</span>}
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left column */}
        <div style={{ width: '38%', background: '#f8fafc', padding: '24px 20px', borderRight: '1px solid #e2e8f0' }}>
          {/* Skills */}
          {skills.length > 0 && (
            <Sidebar title="Skills" accent={ACCENT}>
              {skills.map((cat) => (
                <div key={cat.id} style={{ marginBottom: '10px' }}>
                  {cat.name && (
                    <div style={{ fontWeight: 600, fontSize: '10px', color: '#555', marginBottom: '4px' }}>
                      {cat.name.toUpperCase()}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {cat.skills.map((s, i) => (
                      <span
                        key={i}
                        style={{
                          background: '#e0e7ff',
                          color: ACCENT,
                          padding: '2px 7px',
                          borderRadius: '999px',
                          fontSize: '9px',
                          fontWeight: 500,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </Sidebar>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <Sidebar title="Languages" accent={ACCENT}>
              {languages.map((item) => (
                <div key={item.id} style={{ marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600 }}>{item.language}</span>
                  {item.proficiency && (
                    <span style={{ color: '#666', marginLeft: '6px', fontSize: '10px' }}>
                      {item.proficiency}
                    </span>
                  )}
                </div>
              ))}
            </Sidebar>
          )}

          {/* Education */}
          {education.length > 0 && (
            <Sidebar title="Education" accent={ACCENT}>
              {education.map((item) => (
                <div key={item.id} style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: 600 }}>{item.school}</div>
                  {(item.degree || item.field) && (
                    <div style={{ color: '#555', fontSize: '10px' }}>
                      {[item.degree, item.field].filter(Boolean).join(', ')}
                    </div>
                  )}
                  {(item.startDate || item.endDate) && (
                    <div style={{ color: '#888', fontSize: '10px' }}>
                      {item.startDate}{item.startDate ? ' – ' : ''}{item.current ? 'Present' : item.endDate}
                    </div>
                  )}
                </div>
              ))}
            </Sidebar>
          )}
        </div>

        {/* Right column */}
        <div style={{ flex: 1, padding: '24px 28px' }}>
          {/* Summary */}
          {overview.summary && (
            <MainBlock title="About Me" accent={ACCENT}>
              <p style={{ color: '#444', margin: 0 }}>{overview.summary}</p>
            </MainBlock>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <MainBlock title="Experience" accent={ACCENT}>
              {experience.map((item) => (
                <div key={item.id} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '12px' }}>{item.position}</div>
                      {item.company && <div style={{ color: ACCENT, fontSize: '11px' }}>{item.company}</div>}
                    </div>
                    <div style={{ color: '#888', fontSize: '10px', textAlign: 'right', flexShrink: 0, marginLeft: '8px' }}>
                      {item.startDate}{item.startDate ? ' – ' : ''}{item.current ? 'Present' : item.endDate}
                    </div>
                  </div>
                  {item.bullets.filter(Boolean).length > 0 && (
                    <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                      {item.bullets.filter(Boolean).map((b, i) => (
                        <li key={i} style={{ marginBottom: '2px', color: '#333' }}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </MainBlock>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <MainBlock title="Projects" accent={ACCENT}>
              {projects.map((item) => (
                <div key={item.id} style={{ marginBottom: '14px' }}>
                  <div style={{ fontWeight: 700, fontSize: '12px' }}>{item.name}</div>
                  {item.technologies.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', margin: '3px 0' }}>
                      {item.technologies.map((t, i) => (
                        <span
                          key={i}
                          style={{ background: '#f0f4ff', color: ACCENT, padding: '1px 6px', borderRadius: '4px', fontSize: '9px' }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.description && <div style={{ color: '#444' }}>{item.description}</div>}
                  {item.bullets.filter(Boolean).length > 0 && (
                    <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                      {item.bullets.filter(Boolean).map((b, i) => (
                        <li key={i} style={{ marginBottom: '2px', color: '#333' }}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </MainBlock>
          )}
        </div>
      </div>
    </div>
  );
}

function Sidebar({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3
        style={{
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: accent,
          borderBottom: `2px solid ${accent}`,
          paddingBottom: '4px',
          marginBottom: '10px',
          margin: '0 0 10px 0',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function MainBlock({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '22px' }}>
      <h3
        style={{
          fontSize: '13px',
          fontWeight: 700,
          color: accent,
          borderBottom: `2px solid ${accent}`,
          paddingBottom: '4px',
          marginBottom: '12px',
          margin: '0 0 12px 0',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
