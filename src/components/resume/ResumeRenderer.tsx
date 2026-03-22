import { parseSections } from '@/types/resume';
import type { ResumeSectionDto } from '@/types/resume';
import ClassicTemplate      from './templates/ClassicTemplate';
import ModernTemplate       from './templates/ModernTemplate';
import MinimalTemplate      from './templates/MinimalTemplate';
import MercuryTemplate      from './templates/MercuryTemplate';
import AtlanticBlueTemplate from './templates/AtlanticBlueTemplate';
import SageGreenTemplate    from './templates/SageGreenTemplate';

interface Props {
  sections: ResumeSectionDto[];
  templateId: number | null;
}

export default function ResumeRenderer({ sections, templateId }: Props) {
  const data = parseSections(sections);

  switch (templateId) {
    case 2:  return <ModernTemplate       data={data} />;
    case 3:  return <MinimalTemplate      data={data} />;
    case 4:  return <MercuryTemplate      data={data} />;
    case 5:  return <AtlanticBlueTemplate data={data} />;
    case 6:  return <SageGreenTemplate    data={data} />;
    case 1:
    default: return <ClassicTemplate      data={data} />;
  }
}
