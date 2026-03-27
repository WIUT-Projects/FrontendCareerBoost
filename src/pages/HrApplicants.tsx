import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ApplicationStatusBadge, normalizeStatus } from '@/components/jobs/ApplicationStatusBadge';
import {
  getJobListings,
  getApplicationsByJob,
  updateApplicationStatus,
  type JobListingResponse,
  type JobApplicationResponse,
} from '@/services/jobService';
import { Users, FileText, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { resolveMediaUrl } from '@/lib/utils';

type AppStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected';
const STATUSES: AppStatus[] = ['pending', 'reviewed', 'accepted', 'rejected'];


export default function HrApplicants() {
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedJobId = (location.state as { jobId?: number } | null)?.jobId ?? null;
  const token = session?.access_token ?? '';
  const userId = profile?.id ? Number(profile.id) : null;

  const [myJobs, setMyJobs] = useState<JobListingResponse[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(preselectedJobId);
  const [applications, setApplications] = useState<JobApplicationResponse[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Load HR's own listings
  useEffect(() => {
    if (!userId) return;
    setLoadingJobs(true);
    getJobListings({ pageIndex: 1, pageSize: 100 })
      .then((res) => {
        const isAdmin = profile?.role === 'admin';
        const mine = isAdmin ? res.items : res.items.filter((j) => j.postedBy === userId);
        setMyJobs(mine);
        // Use preselected job if valid, otherwise fall back to first job
        if (!preselectedJobId && mine.length > 0) setSelectedJobId(mine[0].id);
      })
      .catch(() => toast.error('Failed to load job listings'))
      .finally(() => setLoadingJobs(false));
  }, [userId]);

  // Load applications for selected job
  useEffect(() => {
    if (!selectedJobId) return;
    setLoadingApps(true);
    getApplicationsByJob(token, selectedJobId, 1, 50)
      .then((res) => setApplications(res.items))
      .catch(() => toast.error('Failed to load applicants'))
      .finally(() => setLoadingApps(false));
  }, [token, selectedJobId]);

  async function handleStatusChange(appId: number, status: AppStatus) {
    setUpdatingId(appId);
    try {
      const updated = await updateApplicationStatus(token, appId, status);
      setApplications((prev) => prev.map((a) => (a.id === appId ? updated : a)));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Applicant Pipeline</h1>

      {loadingJobs ? (
        <Skeleton className="h-10 w-64 mb-6" />
      ) : myJobs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4" />
          <p>No job listings yet. Create a listing first.</p>
        </div>
      ) : (
        <>
          {/* Job selector */}
          <div className="mb-6">
            <Select
              value={String(selectedJobId)}
              onValueChange={(v) => setSelectedJobId(Number(v))}
            >
              <SelectTrigger className="w-80">
                <SelectValue placeholder="Select a job listing" />
              </SelectTrigger>
              <SelectContent>
                {myJobs.map((job) => (
                  <SelectItem key={job.id} value={String(job.id)}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Applicants table */}
          {loadingApps ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg">
              <p>No applicants for this job yet.</p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Resume</TableHead>
                    <TableHead>Cover Letter</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {app.applicantName ?? `User #${app.applicantId}`}
                      </TableCell>
                      <TableCell>
                        {app.resumeFileUrl ? (
                          <a
                            href={resolveMediaUrl(app.resumeFileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                              <FileText className="h-3.5 w-3.5" />
                              View
                            </Button>
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No resume</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs">
                        {app.coverLetter ? (
                          <span className="line-clamp-2">{app.coverLetter}</span>
                        ) : (
                          <span className="italic">No cover letter</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(app.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ApplicationStatusBadge status={app.status} />
                          <Select
                            value={normalizeStatus(app.status)}
                            onValueChange={(v) => handleStatusChange(app.id, v as AppStatus)}
                            disabled={updatingId === app.id}
                          >
                            <SelectTrigger className="w-32 h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title={`Message ${app.applicantName ?? 'applicant'}`}
                          onClick={() => navigate(`/messages/${app.applicantId}`, {
                            state: { partnerName: app.applicantName },
                          })}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
