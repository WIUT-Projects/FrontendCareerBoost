import type {
  ResumeDto,
  ResumeTemplateDto,
  PagedList,
  ResumeSectionDto,
} from '@/types/resume';

const API_URL = import.meta.env.VITE_API_URL ?? '';

// ─── Templates ────────────────────────────────────────────────────────────────

export async function getTemplates(params?: {
  pageIndex?: number;
  pageSize?: number;
  category?: string;
  tier?: string;
}): Promise<PagedList<ResumeTemplateDto>> {
  const q = new URLSearchParams();
  if (params?.pageIndex) q.set('pageIndex', String(params.pageIndex));
  if (params?.pageSize) q.set('pageSize', String(params.pageSize));
  if (params?.category) q.set('category', params.category);
  if (params?.tier) q.set('tier', params.tier);

  const res = await fetch(`${API_URL}/api/resume-templates?${q}`);
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json();
}

export async function getTemplateById(id: number): Promise<ResumeTemplateDto> {
  const res = await fetch(`${API_URL}/api/resume-templates/${id}`);
  if (!res.ok) throw new Error('Template not found');
  return res.json();
}

// ─── Resumes ──────────────────────────────────────────────────────────────────

export async function getMyResumes(
  token: string,
  params?: { pageIndex?: number; pageSize?: number },
): Promise<PagedList<ResumeDto>> {
  const q = new URLSearchParams();
  if (params?.pageIndex) q.set('pageIndex', String(params.pageIndex));
  if (params?.pageSize) q.set('pageSize', String(params.pageSize));

  const res = await fetch(`${API_URL}/api/resumes?${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch resumes');
  return res.json();
}

export async function getResumeById(
  id: number,
  token: string,
): Promise<ResumeDto> {
  const res = await fetch(`${API_URL}/api/resumes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Resume not found');
  return res.json();
}

export async function createResume(
  token: string,
  body: { title: string; templateId?: number | null; targetRole?: string | null },
): Promise<ResumeDto> {
  const res = await fetch(`${API_URL}/api/resumes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create resume');
  return res.json();
}

export async function updateResume(
  id: number,
  token: string,
  body: { title: string; templateId?: number | null; targetRole?: string | null },
): Promise<ResumeDto> {
  const res = await fetch(`${API_URL}/api/resumes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update resume');
  return res.json();
}

export async function deleteResume(id: number, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/resumes/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete resume');
}

export async function upsertSection(
  resumeId: number,
  sectionType: string,
  content: string,
  token: string,
): Promise<ResumeSectionDto> {
  const res = await fetch(
    `${API_URL}/api/resumes/${resumeId}/sections/${sectionType}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    },
  );
  if (!res.ok) throw new Error('Failed to save section');
  return res.json();
}
