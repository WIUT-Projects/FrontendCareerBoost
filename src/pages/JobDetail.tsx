import { useState, useEffect } from 'react';
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
  type JobListingResponse,
} from '@/services/jobService';
import { MapPin, Briefcase, Clock, Users, Eye, Bookmark, BookmarkCheck, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
  const [applying, setApplying] = useState(false);
  const [savingJob, setSavingJob] = useState(false);

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

  async function handleApply() {
    if (!token) { navigate('/login'); return; }
    setApplying(true);
    try {
      await createApplication(token, { jobId: Number(id), coverLetter: coverLetter || undefined });
      setHasApplied(true);
      setApplyOpen(false);
      setCoverLetter('');
      toast.success('Application submitted!');
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'already_applied') {
        toast.error('You have already applied to this job');
        setHasApplied(true);
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
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">Cover Letter (optional)</label>
              <Textarea
                className="mt-1.5"
                rows={6}
                placeholder="Write a short cover letter..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground mt-1">{coverLetter.length}/5000</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setApplyOpen(false)}>Cancel</Button>
            <Button onClick={handleApply} disabled={applying}>
              {applying ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
