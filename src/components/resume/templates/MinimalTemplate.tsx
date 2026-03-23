import type { ResumeData } from '@/types/resume';

interface Props {
  data: ResumeData;
}

export default function MinimalTemplate({ data }: Props) {
  const { overview, education, experience, projects, skills, languages } = data;

  return (
    <div
      style={{
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        fontSize: '11px',
        lineHeight: '1.6',
        padding: '48px 56px',
        minHeight: '297mm',
        width: '210mm',
        boxSizing: 'border-box',
        background: '#fff',
        color: '#222',
      }}
    >
      {/* Header */}
      {(overview.fullName || overview.title) && (
        <div style={{ marginBottom: '28px' }}>
          {overview.fullName && (
            <h1 style={{ fontSize: '28px', fontWeight: 300, letterSpacing: '-0.5px', margin: 0, color: '#111' }}>
              {overview.fullName}
            </h1>
          )}
          {overview.title && (
            <p style={{ fontSize: '13px', color: '#777', marginTop: '4px', fontWeight: 400, marginBottom: '10px' }}>
              {overview.title}
            </p>
          )}
          {/* Contact: inline, small, gray */}
          <div style={{ display: 'flex', gap: '20px', fontSize: '10px', color: '#888', flexWrap: 'wrap' }}>
            {overview.email && <span>{overview.email}</span>}
            {overview.phone && <span>{overview.phone}</span>}
            {overview.location && <span>{overview.location}</span>}
            {overview.website && <span>{overview.website}</span>}
          </div>
        </div>
      )}

      {/* Thin divider */}
      <div style={{ height: '1px', background: '#eee', marginBottom: '24px' }} />

      {/* Summary */}
      {overview.summary && (
        <MinSection title="Profile">
          <p style={{ color: '#444', margin: 0 }}>{overview.summary}</p>
        </MinSection>
      )}

      {/* Education */}
      {education.length > 0 && (
        <MinSection title="Education">
          {education.map((item) => (
            <div key={item.id} style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{item.school}</div>
                <div style={{ color: '#666' }}>{[item.degree, item.field].filter(Boolean).join(', ')}</div>
              </div>
              <div style={{ color: '#aaa', fontSize: '10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                {item.startDate}{item.startDate ? ' – ' : ''}{item.current ? 'Present' : item.endDate}
              </div>
            </div>
          ))}
        </MinSection>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <MinSection title="Experience">
          {experience.map((item) => (
            <div key={item.id} style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{item.position}</div>
                <div style={{ color: '#666' }}>{item.company}</div>
                {item.bullets.filter(Boolean).length > 0 && (
                  <ul style={{ margin: '6px 0 0 14px', padding: 0, color: '#444' }}>
                    {item.bullets.filter(Boolean).map((b, i) => (
                      <li key={i} style={{ marginBottom: '2px' }}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div style={{ color: '#aaa', fontSize: '10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                {item.startDate}{item.startDate ? ' – ' : ''}{item.current ? 'Present' : item.endDate}
              </div>
            </div>
          ))}
        </MinSection>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <MinSection title="Projects">
          {projects.map((item) => (
            <div key={item.id} style={{ marginBottom: '12px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontWeight: 600 }}>{item.name}</span>
                {item.technologies.length > 0 && (
                  <span style={{ color: '#999', fontSize: '10px' }}>{item.technologies.join(', ')}</span>
                )}
              </div>
              {item.description && <div style={{ color: '#555' }}>{item.description}</div>}
            </div>
          ))}
        </MinSection>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <MinSection title="Skills">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {skills.map((cat) => (
              <div key={cat.id}>
                {cat.name && <span style={{ fontWeight: 600 }}>{cat.name}: </span>}
                <span style={{ color: '#555' }}>{cat.skills.join(', ')}</span>
              </div>
            ))}
          </div>
        </MinSection>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <MinSection title="Languages">
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {languages.map((item) => (
              <span key={item.id}>
                <strong>{item.language}</strong>
                {item.proficiency && <span style={{ color: '#999' }}> ({item.proficiency})</span>}
              </span>
            ))}
          </div>
        </MinSection>
      )}
    </div>
  );
}

function MinSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#999', marginBottom: '10px' }}>
        {title}
      </div>
      {children}
    </div>
  );
}
