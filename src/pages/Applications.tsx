import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ApplicationStatusBadge } from '@/components/jobs/ApplicationStatusBadge';
import {
  getApplicationsByApplicant,
  withdrawApplication,
  type JobApplicationResponse,
} from '@/services/jobService';
import { ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Applications() {
  const { session, profile } = useAuth();
  const token = session?.access_token ?? '';
  const userId = profile?.id ? Number(profile.id) : null;

  const [applications, setApplications] = useState<JobApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawId, setWithdrawId] = useState<number | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getApplicationsByApplicant(token, userId, 1, 50)
      .then((res) => setApplications(res.items))
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  }, [token, userId]);

  async function confirmWithdraw() {
    if (!withdrawId) return;
    setWithdrawing(true);
    try {
      await withdrawApplication(token, withdrawId);
      setApplications((prev) => prev.filter((a) => a.id !== withdrawId));
      toast.success('Application withdrawn');
    } catch {
      toast.error('Failed to withdraw application');
    } finally {
      setWithdrawing(false);
      setWithdrawId(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Applications</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">You haven't applied to any jobs yet.</p>
          <Button asChild variant="link" className="mt-2">
            <Link to="/jobs">Browse Jobs</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <Link
                      to={`/jobs/${app.jobId}`}
                      className="font-medium hover:underline"
                    >
                      {app.jobTitle ?? `Job #${app.jobId}`}
                    </Link>
                    {app.coverLetter && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {app.coverLetter}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(app.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <ApplicationStatusBadge status={app.status} />
                  </TableCell>
                  <TableCell>
                    {app.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setWithdrawId(app.id)}
                      >
                        Withdraw
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Withdraw Confirmation */}
      <AlertDialog open={!!withdrawId} onOpenChange={(open) => !open && setWithdrawId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw this application? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={withdrawing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmWithdraw} disabled={withdrawing}>
              {withdrawing ? 'Withdrawing...' : 'Withdraw'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
