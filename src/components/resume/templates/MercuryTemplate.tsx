import type { ResumeData } from '@/types/resume';

interface Props { data: ResumeData; }

const PROFICIENCY: Record<string, number> = {
  native: 5, fluent: 4, intermediate: 3, basic: 2,
};

function Dots({ level }: { level: string }) {
  const n = PROFICIENCY[level?.toLowerCase()] ?? 3;
  return (
    <span style={{ letterSpacing: '2px', fontSize: '10px', color: '#555' }}>
      {'●'.repeat(n)}{'○'.repeat(5 - n)}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <h2 style={{
          margin: 0, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '2px', color: '#333', whiteSpace: 'nowrap',
        }}>
          {title}
        </h2>
        <div style={{ flex: 1, height: '1px', background: '#ccc' }} />
      </div>
      {children}
    </div>
  );
}

export default function MercuryTemplate({ data }: Props) {
  const { overview, experience, education, projects, skills, languages } = data;

  return (
    <div style={{
      fontFamily: '"Georgia", "Times New Roman", serif',
      fontSize: '10.5px',
      lineHeight: '1.55',
      minHeight: '297mm',
      width: '210mm',
      boxSizing: 'border-box',
      background: '#fff',
      color: '#222',
      padding: '40px 48px',
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '22px', paddingBottom: '18px', borderBottom: '1.5px solid #ccc' }}>
        {/* Avatar placeholder */}
        <div style={{
          width: '70px', height: '70px', borderRadius: '50%', flexShrink: 0,
          background: '#e8e8e8', border: '2px solid #ccc',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#999', fontSize: '9px', fontFamily: 'sans-serif',
        }}>
          Photo
        </div>

        <div style={{ flex: 1 }}>
          {overview.fullName && (
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, letterSpacing: '0.5px', color: '#111' }}>
              {overview.fullName}
            </h1>
          )}
          {overview.title && (
            <p style={{ margin: '2px 0 10px', fontSize: '12px', color: '#555', fontStyle: 'italic' }}>
              {overview.title}
            </p>
          )}
          {/* Contact row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '9.5px', color: '#555', fontFamily: 'Arial, sans-serif' }}>
            {overview.email    && <span>✉ {overview.email}</span>}
            {overview.phone    && <span>✆ {overview.phone}</span>}
            {overview.location && <span>⌖ {overview.location}</span>}
            {overview.website  && <span>⊕ {overview.website}</span>}
          </div>
        </div>
      </div>

      {/* ── Profile ── */}
      {overview.summary && (
        <Section title="Profile">
          <p style={{ margin: 0, color: '#444', lineHeight: '1.6' }}>{overview.summary}</p>
        </Section>
      )}

      {/* ── Work Experience ── */}
      {experience.length > 0 && (
        <Section title="Work Experience">
          {experience.map((item) => (
            <div key={item.id} style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
              {/* Left: date + location */}
              <div style={{ width: '90px', flexShrink: 0, fontSize: '9px', color: '#777', fontFamily: 'Arial, sans-serif', lineHeight: '1.6', paddingTop: '1px' }}>
                <div>{item.startDate}{item.startDate && ' –'}</div>
                <div>{item.current ? 'present' : item.endDate}</div>
              </div>
              {/* Right: content */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '11px' }}>{item.position}</div>
                {item.company && <div style={{ fontSize: '10px', color: '#555', fontStyle: 'italic', marginBottom: '3px' }}>{item.company}</div>}
                {item.bullets.filter(Boolean).length > 0 && (
                  <ul style={{ margin: '3px 0 0 14px', padding: 0 }}>
                    {item.bullets.filter(Boolean).map((b, i) => (
                      <li key={i} style={{ marginBottom: '2px', color: '#333' }}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* ── Education ── */}
      {education.length > 0 && (
        <Section title="Education">
          {education.map((item) => (
            <div key={item.id} style={{ display: 'flex', gap: '16px', marginBottom: '10px' }}>
              <div style={{ width: '90px', flexShrink: 0, fontSize: '9px', color: '#777', fontFamily: 'Arial, sans-serif', lineHeight: '1.6', paddingTop: '1px' }}>
                <div>{item.startDate}{item.startDate && ' –'}</div>
                <div>{item.current ? 'present' : item.endDate}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '11px' }}>{item.school}</div>
                {(item.degree || item.field) && (
                  <div style={{ color: '#555', fontStyle: 'italic', fontSize: '10px' }}>
                    {[item.degree, item.field].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* ── Projects ── */}
      {projects.length > 0 && (
        <Section title="Projects">
          {projects.map((item) => (
            <div key={item.id} style={{ display: 'flex', gap: '16px', marginBottom: '10px' }}>
              <div style={{ width: '90px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <strong style={{ fontSize: '11px' }}>{item.name}</strong>
                  {item.url && <span style={{ fontSize: '9px', color: '#777', fontFamily: 'Arial, sans-serif' }}>{item.url}</span>}
                </div>
                {item.technologies.length > 0 && (
                  <div style={{ color: '#777', fontSize: '9.5px', fontStyle: 'italic', fontFamily: 'Arial, sans-serif' }}>{item.technologies.join(', ')}</div>
                )}
                {item.description && <div style={{ color: '#444', marginTop: '2px' }}>{item.description}</div>}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* ── Skills ── */}
      {skills.length > 0 && (
        <Section title="Skills">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 0' }}>
            {skills.flatMap(c => c.skills).map((s, i) => (
              <div key={i} style={{ width: '33.33%', paddingRight: '8px', boxSizing: 'border-box' }}>
                <span style={{ color: '#333', fontSize: '10px' }}>• {s}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Languages ── */}
      {languages.length > 0 && (
        <Section title="Languages">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 32px' }}>
            {languages.map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 600, fontSize: '10.5px' }}>{item.language}</span>
                <Dots level={item.proficiency} />
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
