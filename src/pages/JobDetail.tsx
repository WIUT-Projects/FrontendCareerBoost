import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  getJobListingById,
  getSavedJobs,
  saveJob,
  unsaveJob,
  getApplicationsByApplicant,
  createApplication,
  uploadJobResume,
  type JobListingResponse,
} from '@/services/jobService';
import { sendMessage } from '@/services/messageService';
import { MapPin, Briefcase, Clock, Users, Eye, Bookmark, BookmarkCheck, Calendar, FileText, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_EXT = ['.pdf', '.doc', '.docx'];

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const token = session?.access_token ?? null;
  const userId = profile?.id ? Number(profile.id) : null;

  const [job, setJob] = useState<JobListingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const [applyOpen, setApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [applying, setApplying] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getJobListingById(Number(id))
      .then(setJob)
      .catch(() => toast.error('Job not found'))
      .finally(() => setLoading(false));
  }, [id]);

  // Check saved and applied status
  useEffect(() => {
    if (!token || !userId || !id) return;
    const jobId = Number(id);

    getSavedJobs(token, 1, 100)
      .then((res) => setIsSaved(res.items.some((s) => s.jobId === jobId)))
      .catch(() => {});

    getApplicationsByApplicant(token, userId, 1, 100)
      .then((res) => setHasApplied(res.items.some((a) => a.jobId === jobId)))
      .catch(() => {});
  }, [token, userId, id]);

  async function handleSaveToggle() {
    if (!token) { navigate('/login'); return; }
    setSavingJob(true);
    try {
      if (isSaved) {
        await unsaveJob(token, Number(id));
        setIsSaved(false);
        toast.success('Removed from saved jobs');
      } else {
        await saveJob(token, Number(id));
        setIsSaved(true);
        toast.success('Job saved');
      }
    } catch {
      toast.error('Failed to update saved status');
    } finally {
      setSavingJob(false);
    }
  }

  function handleFileSelect(file: File) {
    setFileError('');
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXT.includes(ext)) {
      setFileError('Only PDF, DOC, or DOCX files are allowed');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size must be under 10 MB');
      return;
    }
    setResumeFile(file);
  }

  async function handleApply() {
    if (!token) { navigate('/login'); return; }
    setApplying(true);
    try {
      // 1. Upload resume file if provided
      let resumeFileUrl: string | undefined;
      if (resumeFile) {
        resumeFileUrl = await uploadJobResume(token, resumeFile);
      }

      // 2. Submit application
      await createApplication(token, {
        jobId: Number(id),
        resumeFileUrl,
        coverLetter: coverLetter || undefined,
      });

      setHasApplied(true);

      // 3. Auto-message job poster with cover letter
      if (job?.postedBy) {
        const msgBody = coverLetter.trim()
          ? coverLetter.trim()
          : `Hi! I've applied to your job posting "${job.title}".`;
        try {
          await sendMessage(token, job.postedBy, msgBody);
        } catch {
          // messaging failure shouldn't block apply success
        }
        // 4. Navigate to conversation
        setApplyOpen(false);
        setCoverLetter('');
        setResumeFile(null);
        toast.success('Application submitted! Opening conversation...');
        navigate(`/messages/${job.postedBy}`, {
          state: { partnerName: job.postedByName, partnerAvatar: null },
        });
      } else {
        setApplyOpen(false);
        setCoverLetter('');
        setResumeFile(null);
        toast.success('Application submitted!');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'already_applied') {
        toast.error('You have already applied to this job');
        setHasApplied(true);
        setApplyOpen(false);
      } else {
        toast.error('Failed to submit application');
      }
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Job listing not found.</p>
        <Button variant="link" onClick={() => navigate('/jobs')}>Back to Jobs</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="shrink-0 w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
          {job.companyLogoUrl ? (
            <img src={job.companyLogoUrl} alt={job.companyName ?? ''} className="w-full h-full object-cover" />
          ) : (
            <Briefcase className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <p className="text-muted-foreground mt-1">
            {job.companyName ?? job.postedByName ?? 'Unknown company'}
          </p>
        </div>
      </div>

      {/* Meta badges */}
      <div className="flex flex-wrap gap-3 mb-6 text-sm text-muted-foreground">
        {job.location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> {job.location}
          </span>
        )}
        {job.employmentType && (
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> {job.employmentType}
          </span>
        )}
        {job.experienceYears != null && (
          <span className="flex items-center gap-1.5">
            <Briefcase className="w-4 h-4" /> {job.experienceYears}+ years
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Eye className="w-4 h-4" /> {job.viewsCount} views
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="w-4 h-4" /> {job.applicationsCount} applicants
        </span>
        {job.expiresAt && (
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Expires {format(new Date(job.expiresAt), 'MMM d, yyyy')}
          </span>
        )}
      </div>

      {/* Salary */}
      {(job.salaryMin || job.salaryMax) && (
        <div className="mb-6">
          <Badge variant="outline" className="text-base px-3 py-1">
            {job.currency ?? 'USD'}{' '}
            {job.salaryMin && job.salaryMax
              ? `${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()}`
              : job.salaryMin
              ? `${job.salaryMin.toLocaleString()}+`
              : `up to ${job.salaryMax!.toLocaleString()}`}
          </Badge>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mb-8">
        {hasApplied ? (
          <Button disabled>Already Applied</Button>
        ) : (
          <Button onClick={() => token ? setApplyOpen(true) : navigate('/login')}>
            Apply Now
          </Button>
        )}
        <Button
          variant="outline"
          onClick={handleSaveToggle}
          disabled={savingJob}
        >
          {isSaved ? (
            <><BookmarkCheck className="w-4 h-4 mr-2 text-primary" /> Saved</>
          ) : (
            <><Bookmark className="w-4 h-4 mr-2" /> Save Job</>
          )}
        </Button>
      </div>

      {/* Description */}
      {job.description && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Description</h2>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-muted-foreground">
            {job.description}
          </div>
        </section>
      )}

      {/* Required Skills */}
      {job.requiredSkills && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Required Skills</h2>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.split(',').map((skill) => (
              <Badge key={skill.trim()} variant="secondary">
                {skill.trim()}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Posted date */}
      <p className="text-xs text-muted-foreground">
        Posted {format(new Date(job.createdAt), 'MMMM d, yyyy')}
      </p>

      {/* Apply Dialog */}
      <Dialog open={applyOpen} onOpenChange={(open) => { setApplyOpen(open); if (!open) { setResumeFile(null); setFileError(''); setCoverLetter(''); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {/* Resume Upload */}
            <div>
              <label className="text-sm font-medium">Resume (PDF or Word)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
              />
              {resumeFile ? (
                <div className="mt-1.5 flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2.5">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm flex-1 truncate">{resumeFile.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {(resumeFile.size / 1024).toFixed(0)} KB
                  </span>
                  <button
                    type="button"
                    onClick={() => { setResumeFile(null); setFileError(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1.5 w-full flex items-center gap-2 justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 px-4 py-4 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Click to upload resume (PDF, DOC, DOCX · max 10 MB)
                </button>
              )}
              {fileError && <p className="text-xs text-destructive mt-1">{fileError}</p>}
            </div>

            {/* Cover Letter */}
            <div>
              <label className="text-sm font-medium">
                Cover Letter <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Textarea
                className="mt-1.5"
                rows={5}
                placeholder="Write a short cover letter... It will be sent as your first message to the employer."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground mt-1">{coverLetter.length}/5000</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setApplyOpen(false)}>Cancel</Button>
            <Button onClick={handleApply} disabled={applying || !!fileError}>
              {applying ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
