import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, Plus, Trash2, Loader2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { getMyResumes, deleteResume } from '@/services/resumeService';
import { loadSession } from '@/services/authService';
import type { ResumeDto } from '@/types/resume';

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export default function ResumesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = loadSession();

  const [resumes, setResumes] = useState<ResumeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (!session) { navigate('/login'); return; }
    getMyResumes(session.accessToken)
      .then((res) => setResumes(res.items ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!session) return;
    if (!window.confirm(t('resume.deleteConfirm'))) return;
    setDeleting(id);
    try {
      await deleteResume(id, session.accessToken);
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">{t('resume.myResumes')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => navigate('/templates')} className="gap-1.5">
              <Plus className="h-4 w-4" />
              {t('resume.newResume')}
            </Button>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-24">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">{t('resume.noResumes')}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('resume.noResumesHint')}</p>
            <Button className="mt-6" onClick={() => navigate('/templates')}>
              {t('resume.chooseTemplate')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onEdit={() => navigate(`/resumes/${resume.id}/edit`)}
                onDelete={() => handleDelete(resume.id)}
                deleting={deleting === resume.id}
              />
            ))}
            {/* Add new card */}
            <button
              onClick={() => navigate('/templates')}
              className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors min-h-[120px]"
            >
              <Plus className="h-8 w-8" />
              <span className="text-sm font-medium">{t('resume.newResume')}</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function ResumeCard({
  resume, onEdit, onDelete, deleting,
}: {
  resume: ResumeDto;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="border rounded-xl p-5 space-y-3 bg-card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold truncate">{resume.title || 'Untitled'}</h3>
          {resume.templateName && (
            <p className="text-xs text-muted-foreground">{resume.templateName}</p>
          )}
        </div>
        <Badge variant="secondary" className="text-xs shrink-0">
          {resume.status}
        </Badge>
      </div>

      {/* Scores */}
      {(resume.aiScore != null || resume.hrScore != null) && (
        <div className="flex gap-3 text-xs">
          {resume.aiScore != null && (
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
              AI: {resume.aiScore}
            </span>
          )}
          {resume.hrScore != null && (
            <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">
              HR: {resume.hrScore}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-muted-foreground">{timeAgo(resume.updatedAt ?? resume.createdAt)}</span>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" onClick={onEdit} className="gap-1 h-8">
            <Edit3 className="h-3.5 w-3.5" />
            {t('resume.editResume')}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive"
            onClick={onDelete}
            disabled={deleting}
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
