import { parseSections } from '@/types/resume';
import type { ResumeSectionDto } from '@/types/resume';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import MinimalTemplate from './templates/MinimalTemplate';

interface Props {
  sections: ResumeSectionDto[];
  templateId: number | null;
}

export default function ResumeRenderer({ sections, templateId }: Props) {
  const data = parseSections(sections);

  switch (templateId) {
    case 2: return <ModernTemplate data={data} />;
    case 3: return <MinimalTemplate data={data} />;
    // id=4 (Executive) and id=5 (Creative) — fallback to Classic for now
    case 4:
    case 5:
    case 1:
    default:
      return <ClassicTemplate data={data} />;
  }
}
