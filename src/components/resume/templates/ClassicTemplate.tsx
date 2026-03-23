import type { ResumeData } from '@/types/resume';

interface Props {
  data: ResumeData;
}

export default function ClassicTemplate({ data }: Props) {
  const { overview, education, experience, projects, skills, languages } = data;

  return (
    <div
      className="bg-white text-gray-900 font-serif"
      style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '11px', lineHeight: '1.5', padding: '40px 48px', minHeight: '297mm', width: '210mm', boxSizing: 'border-box' }}
    >
      {/* Header */}
      {(overview.fullName || overview.title) && (
        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #1a1a1a', paddingBottom: '16px' }}>
          {overview.fullName && (
            <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>
              {overview.fullName}
            </h1>
          )}
          {overview.title && (
            <p style={{ fontSize: '13px', color: '#555', marginTop: '4px', marginBottom: 0 }}>{overview.title}</p>
          )}
          {/* Contact row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px', fontSize: '10px', color: '#444', flexWrap: 'wrap' }}>
            {overview.email && <span>{overview.email}</span>}
            {overview.phone && <span>{overview.phone}</span>}
            {overview.location && <span>{overview.location}</span>}
            {overview.website && <span>{overview.website}</span>}
          </div>
        </div>
      )}

      {/* Summary */}
      {overview.summary && (
        <SectionBlock title="Summary">
          <p style={{ margin: 0, color: '#333' }}>{overview.summary}</p>
        </SectionBlock>
      )}

      {/* Education */}
      {education.length > 0 && (
        <SectionBlock title="Education">
          {education.map((item) => (
            <div key={item.id} style={{ marginBottom: '10px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '12px' }}>{item.school}</strong>
                <span style={{ color: '#666', fontSize: '10px' }}>
                  {item.startDate}{item.startDate ? ' – ' : ''}{item.current ? 'Present' : item.endDate}
                </span>
              </div>
              {(item.degree || item.field) && (
                <div style={{ color: '#555' }}>{[item.degree, item.field].filter(Boolean).join(', ')}</div>
              )}
              {item.description && <div style={{ color: '#666', marginTop: '2px' }}>{item.description}</div>}
            </div>
          ))}
        </SectionBlock>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <SectionBlock title="Experience">
          {experience.map((item) => (
            <div key={item.id} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '12px' }}>{item.position}</strong>
                <span style={{ color: '#666', fontSize: '10px' }}>
                  {item.startDate}{item.startDate ? ' – ' : ''}{item.current ? 'Present' : item.endDate}
                </span>
              </div>
              {item.company && <div style={{ color: '#555', fontStyle: 'italic' }}>{item.company}</div>}
              {item.bullets.filter(Boolean).length > 0 && (
                <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  {item.bullets.filter(Boolean).map((b, i) => (
                    <li key={i} style={{ marginBottom: '2px' }}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </SectionBlock>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <SectionBlock title="Projects">
          {projects.map((item) => (
            <div key={item.id} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <strong style={{ fontSize: '12px' }}>{item.name}</strong>
                {item.url && <span style={{ color: '#666', fontSize: '10px' }}>{item.url}</span>}
              </div>
              {item.technologies.length > 0 && (
                <div style={{ color: '#555', fontStyle: 'italic', fontSize: '10px' }}>
                  {item.technologies.join(' · ')}
                </div>
              )}
              {item.description && <div style={{ color: '#444', marginTop: '2px' }}>{item.description}</div>}
              {item.bullets.filter(Boolean).length > 0 && (
                <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  {item.bullets.filter(Boolean).map((b, i) => (
                    <li key={i} style={{ marginBottom: '2px' }}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </SectionBlock>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <SectionBlock title="Skills">
          {skills.map((cat) => (
            <div key={cat.id} style={{ marginBottom: '4px' }}>
              {cat.name && <strong>{cat.name}: </strong>}
              <span style={{ color: '#444' }}>{cat.skills.join(', ')}</span>
            </div>
          ))}
        </SectionBlock>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <SectionBlock title="Languages">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {languages.map((item) => (
              <span key={item.id}>
                <strong>{item.language}</strong>
                {item.proficiency && <span style={{ color: '#666' }}> — {item.proficiency}</span>}
              </span>
            ))}
          </div>
        </SectionBlock>
      )}
    </div>
  );
}

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h2 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid #1a1a1a', paddingBottom: '4px', marginBottom: '10px', margin: '0 0 10px 0' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
