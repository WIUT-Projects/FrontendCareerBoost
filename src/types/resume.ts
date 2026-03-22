// ─── Section Types ─────────────────────────────────────────────────────────────

export type SectionType =
  | 'overview'
  | 'education'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'languages';

export const SECTION_ORDER: SectionType[] = [
  'overview',
  'education',
  'experience',
  'projects',
  'skills',
  'languages',
];

// ─── API DTOs ──────────────────────────────────────────────────────────────────

export interface ResumeSectionDto {
  id: number;
  sectionType: SectionType;
  sortOrder: number;
  content: string; // JSON string
}

export interface ResumeDto {
  id: number;
  title: string;
  status: string;
  targetRole: string | null;
  templateId: number | null;
  templateName: string | null;
  aiScore: number | null;
  hrScore: number | null;
  sections: ResumeSectionDto[];
  createdAt: string;
  updatedAt: string | null;
}

export interface ResumeTemplateDto {
  id: number;
  authorId: number;
  authorName: string;
  name: string;
  thumbnailUrl: string | null;
  previewUrl: string | null;
  tier: 'free' | 'premium';
  priceUzs: number | null;
  category: string | null;
  downloadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface PagedList<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ─── Section Content Types ─────────────────────────────────────────────────────

export interface OverviewContent {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  url: string;
  technologies: string[];
  bullets: string[];
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: 'native' | 'fluent' | 'intermediate' | 'basic';
}

// ─── Parsed Resume Data (for template renderers) ───────────────────────────────

export interface ResumeData {
  overview: OverviewContent;
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillCategory[];
  languages: LanguageItem[];
}

export const EMPTY_OVERVIEW: OverviewContent = {
  fullName: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  summary: '',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

export function parseSections(sections: ResumeSectionDto[]): ResumeData {
  const get = (type: SectionType): string => {
    const s = sections.find((s) => s.sectionType === type);
    return s?.content ?? (type === 'overview' ? '{}' : '[]');
  };

  const parseJson = <T>(raw: string, fallback: T): T => {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  };

  return {
    overview: parseJson<OverviewContent>(get('overview'), { ...EMPTY_OVERVIEW }),
    education: parseJson<EducationItem[]>(get('education'), []),
    experience: parseJson<ExperienceItem[]>(get('experience'), []),
    projects: parseJson<ProjectItem[]>(get('projects'), []),
    skills: parseJson<SkillCategory[]>(get('skills'), []),
    languages: parseJson<LanguageItem[]>(get('languages'), []),
  };
}
